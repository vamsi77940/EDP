import type { User } from '@supabase/supabase-js';
import {
  INITIAL_ACTIVITIES,
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  INITIAL_POLLS,
} from '../data/mockData';
import type { Complaint, ComplaintComment, FunActivity, LocalNotice, Poll } from '../types';
import { supabase } from './supabase';

export type CommunityRole = 'citizen' | 'officer' | 'developer';
type RecordKind = 'complaint' | 'notice' | 'activity' | 'poll';

interface CommunityRecord {
  id: string;
  kind: RecordKind;
  data: unknown;
  owner_id: string;
}

export interface CommunityData {
  complaints: Complaint[];
  notices: LocalNotice[];
  activities: FunActivity[];
  polls: Poll[];
}

const requireClient = () => {
  if (!supabase) throw new Error('Supabase is not configured. Set the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables.');
  return supabase;
};

export async function getCommunityRole(userId: string): Promise<CommunityRole> {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data.role as CommunityRole;
}

export async function loadCommunityData(userId: string): Promise<CommunityData> {
  const client = requireClient();
  const [recordsResult, endorsementsResult, votesResult, commentsResult, contactsResult] = await Promise.all([
    client.from('community_records').select('id,kind,data,owner_id'),
    client.from('complaint_endorsements').select('complaint_id,user_id'),
    client.from('poll_votes').select('poll_id,user_id,option_id'),
    client.from('complaint_comments').select('id,complaint_id,user_id,data,created_at'),
    client.from('complaint_contacts').select('complaint_id,phone'),
  ]);
  const participationResult = await client
    .from('activity_participations')
    .select('activity_id,user_id,action_type,action_key,data,created_at')
    .order('created_at');

  for (const result of [recordsResult, endorsementsResult, votesResult, commentsResult, contactsResult, participationResult]) {
    if (result.error) throw result.error;
  }

  const records = recordsResult.data as CommunityRecord[];
  const endorsements = endorsementsResult.data;
  const votes = votesResult.data;
  const comments = commentsResult.data;
  const contacts = contactsResult.data;
  const participations = participationResult.data;

  return {
    complaints: records
      .filter((record) => record.kind === 'complaint')
      .map((record) => {
        const complaint = record.data as unknown as Complaint;
        const complaintEndorsements = endorsements.filter((row) => row.complaint_id === record.id);
        const complaintComments: ComplaintComment[] = comments
          .filter((row) => row.complaint_id === record.id)
          .map((row) => ({
            ...(row.data as unknown as Omit<ComplaintComment, 'id' | 'timestamp'>),
            id: row.id,
            timestamp: new Date(row.created_at).toLocaleString(),
            isOfficer: false,
          }));
        return {
          ...complaint,
          filedPhone: contacts.find((row) => row.complaint_id === record.id)?.phone,
          userUpvoted: complaintEndorsements.some((row) => row.user_id === userId),
          comments: complaintComments,
        };
      }),
    notices: records
      .filter((record) => record.kind === 'notice')
      .map((record) => record.data as unknown as LocalNotice),
    activities: records
      .filter((record) => record.kind === 'activity')
      .map((record) => {
        const activity = record.data as unknown as FunActivity;
        const activityActions = participations.filter((action) => action.activity_id === record.id);
        return {
          ...activity,
          userRsvp: activityActions.some((action) => action.user_id === userId && action.action_type === 'rsvp'),
          userGuests: Number(activityActions.find((action) => action.user_id === userId && action.action_type === 'rsvp')?.data.familyCount ?? 0),
          attendees: [
            ...activity.attendees,
            ...activityActions
              .filter((action) => action.action_type === 'rsvp')
              .map((action) => ({
                name: String(action.data.displayName ?? 'Resident'),
                lane: 'Community',
                familyCount: Number(action.data.familyCount ?? 1),
              })),
          ],
          volunteerRoles: activity.volunteerRoles.map((role) => ({
            ...role,
            assignedVolunteers: [
              ...role.assignedVolunteers,
              ...activityActions
                .filter((action) => action.action_type === 'volunteer' && action.action_key === role.roleName)
                .map((action) => String(action.data.displayName ?? 'Resident')),
            ],
          })),
          chatMessages: [
            ...activity.chatMessages,
            ...activityActions
              .filter((action) => action.action_type === 'chat')
              .map((action) => ({
                id: action.user_id + action.created_at,
                author: String(action.data.displayName ?? 'Resident'),
                text: String(action.data.text ?? ''),
                time: new Date(action.created_at).toLocaleTimeString(),
              })),
          ],
        };
      }),
    polls: records
      .filter((record) => record.kind === 'poll')
      .map((record) => {
        const poll = record.data as unknown as Poll;
        const userVote = votes.find((row) => row.poll_id === record.id && row.user_id === userId);
        return { ...poll, userVotedOptionId: userVote?.option_id };
      }),
  };
}

export async function seedCommunityData(user: User): Promise<void> {
  const client = requireClient();
  const { count, error: countError } = await client
    .from('community_records')
    .select('id', { count: 'exact', head: true });
  if (countError) throw countError;
  if (count) return;

  const records: { id: string; kind: RecordKind; data: object; owner_id: string }[] = [
    ...INITIAL_COMPLAINTS.map((item) => {
      const { filedPhone: _filedPhone, userUpvoted: _userUpvoted, ...publicComplaint } = item;
      return { id: item.id, kind: 'complaint' as const, data: publicComplaint, owner_id: user.id };
    }),
    ...INITIAL_NOTICES.map((item) => ({ id: item.id, kind: 'notice' as const, data: item, owner_id: user.id })),
    ...INITIAL_ACTIVITIES.map((item) => ({
      id: item.id,
      kind: 'activity' as const,
      data: { ...item, userRsvp: false, userGuests: 0 },
      owner_id: user.id,
    })),
    ...INITIAL_POLLS.map((item) => ({ id: item.id, kind: 'poll' as const, data: item, owner_id: user.id })),
  ];
  const { error } = await client.from('community_records').upsert(records, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function createCommunityRecord(
  kind: RecordKind,
  id: string,
  data: object,
  userId: string,
): Promise<void> {
  const client = requireClient();
  const recordData = { ...data } as Record<string, unknown>;
  if (kind === 'activity') {
    recordData.userRsvp = false;
    recordData.userGuests = 0;
  }
  if (kind === 'complaint') {
    const { error } = await client.rpc('file_complaint', {
      p_record_id: id,
      p_data: recordData,
      p_contact_phone: typeof recordData.filedPhone === 'string' ? recordData.filedPhone : '',
    });
    if (error) throw error;
    return;
  }
  if (kind === 'activity') {
    const volunteerRoles = recordData.volunteerRoles as FunActivity['volunteerRoles'] | undefined;
    if (volunteerRoles) {
      recordData.volunteerRoles = volunteerRoles.map((role) => ({ ...role, assignedVolunteers: [] }));
    }
    recordData.chatMessages = [];
  }
  const { error } = await client.from('community_records').insert({
    id,
    kind,
    data: recordData,
    owner_id: userId,
  });
  if (error) throw error;
}

export async function updateCommunityRecord(
  kind: RecordKind,
  id: string,
  data: object,
): Promise<void> {
  const client = requireClient();
  const recordData = { ...data } as Record<string, unknown>;
  if (kind === 'complaint') {
    delete recordData.filedPhone;
    delete recordData.userUpvoted;
    delete recordData.comments;
  }
  const { error } = await client.from('community_records').update({ data: recordData }).eq('id', id);
  if (error) throw error;
}

export async function addComplaintComment(
  complaintId: string,
  userId: string,
  authorName: string,
  comment: Omit<ComplaintComment, 'id' | 'timestamp' | 'authorName' | 'isOfficer'>,
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('complaint_comments').insert({
    complaint_id: complaintId,
    user_id: userId,
    data: { ...comment, authorName },
  });
  if (error) throw error;
}

export async function toggleComplaintEndorsement(complaintId: string): Promise<void> {
  const { error } = await requireClient().rpc('toggle_complaint_endorsement', {
    p_complaint_id: complaintId,
  });
  if (error) throw error;
}

export async function castPollVote(pollId: string, optionId: string): Promise<void> {
  const { error } = await requireClient().rpc('cast_poll_vote', {
    p_poll_id: pollId,
    p_option_id: optionId,
  });
  if (error) throw error;
}

export async function toggleActivityRsvp(
  activityId: string,
  userId: string,
  familyCount: number,
): Promise<void> {
  const client = requireClient();
  const { data, error } = await client
    .from('activity_participations')
    .select('id')
    .eq('activity_id', activityId)
    .eq('user_id', userId)
    .eq('action_type', 'rsvp')
    .maybeSingle();
  if (error) throw error;

  if (data) {
    const { error: deleteError } = await client.from('activity_participations').delete().eq('id', data.id);
    if (deleteError) throw deleteError;
    return;
  }

  const { error: insertError } = await client.from('activity_participations').insert({
    activity_id: activityId,
    user_id: userId,
    action_type: 'rsvp',
    data: { familyCount },
  });
  if (insertError) throw insertError;
}

export async function volunteerForActivity(
  activityId: string,
  userId: string,
  roleName: string,
): Promise<void> {
  const { error } = await requireClient().from('activity_participations').insert({
    activity_id: activityId,
    user_id: userId,
    action_type: 'volunteer',
    action_key: roleName,
    data: {},
  });
  if (error) throw error;
}

export async function addActivityChatMessage(
  activityId: string,
  userId: string,
  text: string,
): Promise<void> {
  const { error } = await requireClient().from('activity_participations').insert({
    activity_id: activityId,
    user_id: userId,
    action_type: 'chat',
    data: { text },
  });
  if (error) throw error;
}
