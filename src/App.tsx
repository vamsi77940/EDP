import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintComment, 
  LocalNotice, 
  FunActivity, 
  LocalArea, 
  Language,
  UserRole,
  Poll
} from './types';
import { getLocalizedText } from './data/mockData';
import { Header } from './components/Header';
import { NoticeBoardView } from './components/NoticeBoardView';
import { ComplaintsView } from './components/ComplaintsView';
import { ActivityPlannerView } from './components/ActivityPlannerView';
import { InviteView } from './components/InviteView';
import { NewComplaintModal } from './components/NewComplaintModal';
import { OfficerPanel } from './components/OfficerPanel';
import { AdminPanel } from './components/AdminPanel';
import { PollsView } from './components/PollsView';
import { t } from './translations';
import { AuthScreen } from './components/AuthScreen';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  addComplaintComment,
  addActivityChatMessage,
  castPollVote,
  CommunityData,
  CommunityRole,
  createCommunityRecord,
  getCommunityRole,
  loadCommunityData,
  seedCommunityData,
  toggleComplaintEndorsement,
  toggleActivityRsvp,
  updateCommunityRecord,
  volunteerForActivity,
} from './lib/communityData';
import type { Session, User } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<CommunityRole | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }

    let isActive = true;
    const loadRole = async (user: User) => {
      try {
        const userRole = await getCommunityRole(user.id);
        if (isActive) {
          setRole(userRole);
          setAuthError('');
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Could not load the signed-in user role.', error);
        if (isActive) {
          setAuthError(error instanceof Error ? error.message : 'Could not load your account role.');
          setIsInitializing(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isActive) return;
      if (error) {
        setAuthError(error.message);
        setIsInitializing(false);
        return;
      }
      setSession(data.session);
      if (data.session) void loadRole(data.session.user);
      else setIsInitializing(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setRole(null);
      setAuthError('');
      if (nextSession) void loadRole(nextSession.user);
      else setIsInitializing(false);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-800">
        <section className="mx-auto mt-20 max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow">
          <h1 className="text-xl font-bold">Connect Supabase to continue</h1>
          <p className="mt-3 text-sm leading-6">
            Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase project URL and publishable key, then run <code>npm run dev</code> again.
          </p>
        </section>
      </main>
    );
  }

  if (isInitializing) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading your account…</div>;
  }

  if (authError) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <section className="mx-auto mt-20 max-w-xl rounded-2xl border border-rose-200 bg-white p-6 shadow">
          <h1 className="text-xl font-bold text-rose-800">Could not load your account</h1>
          <p className="mt-3 text-sm text-slate-700">{authError}</p>
          <button className="mt-5 font-semibold text-amber-800" onClick={() => void supabase?.auth.signOut()} type="button">
            Sign out
          </button>
        </section>
      </main>
    );
  }

  if (!session) return <AuthScreen />;
  if (!role) return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading your role…</div>;

  return (
    <WorkspaceApp
      onSignOut={() => supabase?.auth.signOut()}
      role={role}
      user={session.user}
    />
  );
}

interface WorkspaceAppProps {
  role: UserRole;
  user: User;
  onSignOut: () => void | Promise<unknown>;
}

function WorkspaceApp({ role, user, onSignOut }: WorkspaceAppProps) {
  // Multilingual State (English, Hindi, Telugu) Preserved
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('community_app_lang');
      if (saved === 'hi' || saved === 'te' || saved === 'en') return saved;
    } catch (e) {
      console.warn(e);
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('community_app_lang', language);
    } catch (e) {
      console.warn(e);
    }
  }, [language]);

  const activeRole = role;

  // Senior Citizen / High Accessibility Mode State
  const [seniorCitizenMode, setSeniorCitizenMode] = useState<boolean>(false);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<LocalNotice[]>([]);
  const [activities, setActivities] = useState<FunActivity[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Tab & Area Navigation State
  const [activeTab, setActiveTab] = useState<'notices' | 'complaints' | 'polls' | 'activities' | 'invite'>('activities');
  const [selectedArea, setSelectedArea] = useState<LocalArea>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Toast States
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const applyCommunityData = (data: CommunityData) => {
    setComplaints(data.complaints);
    setNotices(data.notices);
    setActivities(data.activities);
    setPolls(data.polls);
  };

  const refreshCommunityData = async () => {
    applyCommunityData(await loadCommunityData(user.id));
  };

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        if (role === 'developer') await seedCommunityData(user);
        const data = await loadCommunityData(user.id);
        if (isActive) applyCommunityData(data);
      } catch (error) {
        console.error('Could not load community data from Supabase.', error);
        if (isActive) showToast(error instanceof Error ? error.message : 'Could not load community data.');
      } finally {
        if (isActive) setIsDataLoading(false);
      }
    };
    void load();
    return () => {
      isActive = false;
    };
  }, [role, user]);

  const persistAction = async (action: () => Promise<void>) => {
    try {
      await action();
      await refreshCommunityData();
      return true;
    } catch (error) {
      console.error('Could not save community changes.', error);
      showToast(error instanceof Error ? error.message : 'Could not save your change. Please try again.');
      return false;
    }
  };

  // Complaint Upvote ("Affects My Galli Too")
  const handleToggleUpvote = async (id: string) => {
    const saved = await persistAction(() => toggleComplaintEndorsement(id));
    if (saved) showToast(
      language === 'hi' 
        ? 'आपका समर्थन "हमारी गली भी प्रभावित" दर्ज किया गया!' 
        : language === 'te' 
        ? 'మీ మద్దతు "మా వీధిని కూడా ప్రభావితం చేస్తుంది" నమోదు చేయబడింది!' 
        : 'Your endorsement "Affects My Galli Too" recorded!'
    );
  };

  // Add Comment on Complaint
  const handleAddComment = async (
    id: string,
    commentData: Omit<ComplaintComment, 'id' | 'timestamp'>
  ) => {
    const saved = await persistAction(() =>
      addComplaintComment(id, user.id, user.email ?? 'Resident', {
        authorLane: commentData.authorLane,
        text: commentData.text,
        text_hi: commentData.text_hi,
        text_te: commentData.text_te,
      })
    );
    if (saved) showToast(
      language === 'hi' 
        ? 'आपकी टिप्पणी सार्वजनिक शिकायत रिकॉर्ड में जोड़ दी गई है।' 
        : language === 'te' 
        ? 'మీ వ్యాఖ్య ప్రజా ఫిర్యాదుల రికార్డుకు జోడించబడింది.' 
        : 'Your comment has been added to the public grievance record.'
    );
  };

  // Officer Update Status
  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus, notes?: string) => {
    const complaint = complaints.find((item) => item.id === id);
    if (!complaint) return;
    const updated = {
      ...complaint,
      status: newStatus,
      officialResolutionNotes: notes || complaint.officialResolutionNotes,
      expectedResolution: newStatus === 'resolved' ? 'Paka Resolved Today' : complaint.expectedResolution,
    };
    const saved = await persistAction(() => updateCommunityRecord('complaint', id, updated));
    if (saved) showToast(`Status updated to: ${newStatus.toUpperCase()}`);
  };

  // File New Complaint
  const handleCreateComplaint = async (newComplaint: Complaint) => {
    const saved = await persistAction(() =>
      createCommunityRecord('complaint', newComplaint.id, newComplaint, user.id)
    );
    if (!saved) return;
    setActiveTab('complaints');
    showToast(
      language === 'hi'
        ? `शिकायत #${newComplaint.ticketNumber} दर्ज हुई! सहायक अभियंता को अलर्ट भेजा गया।`
        : language === 'te'
        ? `ఫిర్యాదు #${newComplaint.ticketNumber} నమోదైంది! అసిస్టెంట్ ఇంజనీర్‌కు హెచ్చరిక పంపబడింది.`
        : `Ticket #${newComplaint.ticketNumber} registered! Alert dispatched to Assistant Engineer.`
    );
  };

  // Add New Notice
  const handleAddNewNotice = async (newNotice: LocalNotice) => {
    const saved = await persistAction(() =>
      createCommunityRecord('notice', newNotice.id, newNotice, user.id)
    );
    if (!saved) return;
    showToast(
      language === 'hi'
        ? 'नई नागरिक सूचना बोर्ड पर प्रकाशित कर दी गई है!'
        : language === 'te'
        ? 'కొత్త పౌర సమాచారం నోటీసు బోర్డులో ప్రచురించబడింది!'
        : 'New civic notice published to the Community board!'
    );
  };

  // Fun Activity RSVP Toggle
  const handleToggleActivityRsvp = async (activityId: string, familyCount: number) => {
    const saved = await persistAction(() =>
      toggleActivityRsvp(activityId, user.id, familyCount || 3)
    );
    if (saved) showToast('Your RSVP has been updated!');
  };

  // Volunteer Signup
  const handleVolunteer = async (activityId: string, roleName: string, _volunteerName: string) => {
    const saved = await persistAction(() =>
      volunteerForActivity(activityId, user.id, roleName)
    );
    if (saved) showToast(`Shukriya / Dhanyavad! You are signed up for "${roleName}".`);
  };

  // Activity Chat Message
  const handleAddActivityChat = async (activityId: string, _author: string, text: string) => {
    const saved = await persistAction(() =>
      addActivityChatMessage(activityId, user.id, text)
    );
    if (saved) showToast('Message posted to the discussion wall!');
  };

  // Propose Activity
  const handleProposeActivity = async (newAct: FunActivity) => {
    const saved = await persistAction(() =>
      createCommunityRecord('activity', newAct.id, newAct, user.id)
    );
    if (!saved) return;
    setActiveTab('activities');
    showToast('New community activity proposed! Neighbors can now RSVP and join.');
  };

  // Vote on Citizen Poll
  const handleVoteOnPoll = async (pollId: string, optionId: string) => {
    const saved = await persistAction(() => castPollVote(pollId, optionId));
    if (saved) showToast('Your vote has been cast successfully!');
  };

  // Add Poll from Admin Panel
  const handleAddPoll = async (newPoll: Poll) => {
    const saved = await persistAction(() =>
      createCommunityRecord('poll', newPoll.id, newPoll, user.id)
    );
    if (saved) showToast('New Ward Poll Published!');
  };

  // WhatsApp Share helpers (Localized)
  const handleShareNotice = (notice: LocalNotice) => {
    const title = getLocalizedText(notice, 'title', language);
    const details = getLocalizedText(notice, 'details', language);
    const text = `📢 *CIVIC NOTICE: ${title}*\n📍 *Locality:* ${notice.areaAffected}\n⏰ *Time:* ${notice.scheduledTime}\n📝 *Details:* ${details}\n📞 *Helpline:* ${notice.contactPerson}\n\n👉 Track live on Community Portal:\nhttps://community-civic.app/?notice=${notice.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareComplaint = (complaint: Complaint) => {
    const title = getLocalizedText(complaint, 'title', language);
    const location = getLocalizedText(complaint, 'locationDetails', language);
    const text = `📬 *GRIEVANCE ALERT #${complaint.ticketNumber}*\n*Subject:* ${title}\n📍 *Spot:* ${location}\n👷 *In-Charge:* ${complaint.assignedOfficer.name}\n⚡ *Status:* ${complaint.status.toUpperCase()}\n\n👉 Add your support on Community portal:\nhttps://community-civic.app/?ticket=${complaint.ticketNumber}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareActivity = (act: FunActivity) => {
    const title = getLocalizedText(act, 'title', language);
    const venue = getLocalizedText(act, 'venue', language);
    const text = `🎉 *COMMUNITY INVITATION: ${title}*\n📅 *Date:* ${act.date} • ${act.time}\n📍 *Venue:* ${venue}\n\n👉 RSVP along with family:\nhttps://community-civic.app/?event=${act.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const openComplaintsCount = complaints.filter((c) => c.status !== 'resolved').length;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-all ${
      seniorCitizenMode ? 'text-lg leading-relaxed' : 'text-sm'
    }`}>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header with Role Switcher, Senior Mode & Language Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        onOpenFileComplaint={() => setIsNewComplaintOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openComplaintsCount={openComplaintsCount}
        upcomingEventsCount={activities.length}
        activeRole={activeRole}
        userEmail={user.email ?? ''}
        onSignOut={onSignOut}
        language={language}
        setLanguage={setLanguage}
        seniorCitizenMode={seniorCitizenMode}
        setSeniorCitizenMode={setSeniorCitizenMode}
      />

      {/* Main Content Area based on Active Role */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {isDataLoading && (
          <div className="py-20 text-center font-semibold text-slate-500">Loading shared community data…</div>
        )}
        {/* ROLE 1: CITIZEN VIEW */}
        {!isDataLoading && (activeRole === 'citizen' || activeRole === 'developer') && (
          <>
            {activeTab === 'notices' && (
              <NoticeBoardView
                notices={notices}
                selectedArea={selectedArea}
                onShareNotice={handleShareNotice}
                onAddNewNotice={handleAddNewNotice}
                isStaffMode={activeRole === 'developer'}
                language={language}
              />
            )}

            {activeTab === 'complaints' && (
              <ComplaintsView
                complaints={complaints}
                selectedArea={selectedArea}
                onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
                onToggleUpvote={handleToggleUpvote}
                onAddComment={handleAddComment}
                onShareComplaint={handleShareComplaint}
                isStaffMode={false}
                language={language}
              />
            )}

            {activeTab === 'polls' && (
              <PollsView
                polls={polls}
                onVote={handleVoteOnPoll}
                language={language}
                selectedArea={selectedArea}
                seniorCitizenMode={seniorCitizenMode}
              />
            )}

            {activeTab === 'activities' && (
              <ActivityPlannerView
                activities={activities}
                onToggleRsvp={handleToggleActivityRsvp}
                onVolunteer={handleVolunteer}
                onAddChatMessage={handleAddActivityChat}
                onProposeActivity={handleProposeActivity}
                onShareActivity={handleShareActivity}
                language={language}
              />
            )}

            {activeTab === 'invite' && (
              <InviteView onShowToast={showToast} language={language} />
            )}
          </>
        )}

        {/* ROLE 2: OFFICER PANEL */}
        {activeRole === 'officer' && (
          <OfficerPanel
            complaints={complaints}
            onUpdateStatus={handleUpdateStatus}
            language={language}
            selectedArea={selectedArea}
          />
        )}

        {/* ROLE 3: ADMIN PANEL */}
        {activeRole === 'developer' && (
          <AdminPanel
            language={language}
            selectedArea={selectedArea}
            polls={polls}
            onAddPoll={handleAddPoll}
          />
        )}
      </main>

      {/* New Complaint Filing Modal */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onSubmit={handleCreateComplaint}
        defaultArea={selectedArea}
        language={language}
      />

      {/* Municipal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 font-serif">
                MANA WARD • {t(language, 'appTagline')}
              </p>
              <p className="text-[11px] text-slate-500">
                {t(language, 'footerSub')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>{t(language, 'footerSwachh')}</span>
            <span>•</span>
            <span>{t(language, 'footerRti')}</span>
            <span>•</span>
            <span className="font-mono">{t(language, 'emergencyHelpline')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
