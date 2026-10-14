export type Language = 'en' | 'hi' | 'te';

export type LocalArea = 
  | 'all' 
  | 'mehdipatnam' 
  | 'banjara-jubilee' 
  | 'old-city' 
  | 'madhapur-kondapur' 
  | 'secunderabad';

export interface AreaInfo {
  id: LocalArea;
  name: string;
  name_hi: string;
  name_te: string;
  circleZone: string;
  circleZone_hi: string;
  circleZone_te: string;
  councillor: string;
  phone: string;
}

export type ComplaintCategory = 
  | 'hmwssb_water'
  | 'ghmc_sanitation'
  | 'tsspdcl_electricity'
  | 'roads_srdp'
  | 'drainage_manhole'
  | 'traffic_encroachment'
  | 'parks_lakes';

export interface ComplaintCategoryConfig {
  id: ComplaintCategory;
  name: string;
  name_hi: string;
  name_te: string;
  hyderabadiName: string;
  icon: string;
  colorClass: string;
}

export type ComplaintStatus = 
  | 'submitted'
  | 'assigned'
  | 'field_work'
  | 'resolved';

export interface StatusStepConfig {
  label: string;
  label_hi: string;
  label_te: string;
  hyderabadiLabel: string;
  badgeClass: string;
  step: number;
  description: string;
}

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface AccessibilitySettings {
  seniorCitizenMode: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export type SlaStatus = 'on_track' | 'approaching_sla' | 'overdue';

export interface ComplaintComment {
  id: string;
  authorName: string;
  authorLane: string;
  timestamp: string;
  text: string;
  text_hi?: string;
  text_te?: string;
  isOfficer?: boolean;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  title_hi?: string;
  title_te?: string;
  category: ComplaintCategory;
  area: LocalArea;
  locationDetails: string;
  locationDetails_hi?: string;
  locationDetails_te?: string;
  description: string;
  description_hi?: string;
  description_te?: string;
  urgency: 'Tatkāl (Emergency)' | 'Zaroori (Moderate)' | 'Routine';
  filedBy: string;
  filedPhone?: string;
  createdAt: string;
  expectedResolution: string;
  expectedResolution_hi?: string;
  expectedResolution_te?: string;
  status: ComplaintStatus;
  assignedOfficer: {
    name: string;
    designation: string;
    designation_hi?: string;
    designation_te?: string;
    department: string;
    department_hi?: string;
    department_te?: string;
    contactPhone: string;
  };
  upvotes: number;
  userUpvoted: boolean;
  comments: ComplaintComment[];
  officialResolutionNotes?: string;
  officialResolutionNotes_hi?: string;
  officialResolutionNotes_te?: string;
  imageUrl?: string;
  
  // Advanced Officer & Admin fields
  latitude?: number;
  longitude?: number;
  aiCategoryConfidence?: number;
  aiSuggestedDepartment?: string;
  slaHoursRemaining?: number;
  slaStatus?: SlaStatus;
  proofImageUrl?: string;
}

export interface LocalNotice {
  id: string;
  title: string;
  title_hi?: string;
  title_te?: string;
  category: 'HMWSSB Water' | 'GHMC Road Work' | 'TSSPDCL Power' | 'Health Camp' | 'Swachh Auto' | 'General';
  category_hi?: string;
  category_te?: string;
  areaAffected: string;
  areaAffected_hi?: string;
  areaAffected_te?: string;
  scheduledTime: string;
  scheduledTime_hi?: string;
  scheduledTime_te?: string;
  date: string;
  details: string;
  details_hi?: string;
  details_te?: string;
  status: 'Ongoing' | 'Scheduled' | 'Completed';
  contactPerson: string;
}

export interface ActivityVolunteerRole {
  roleName: string;
  roleName_hi?: string;
  roleName_te?: string;
  requiredCount: number;
  assignedVolunteers: string[];
}

export interface ActivityAttendee {
  name: string;
  lane: string;
  familyCount: number;
}

export interface FunActivity {
  id: string;
  title: string;
  title_hi?: string;
  title_te?: string;
  tagline: string;
  tagline_hi?: string;
  tagline_te?: string;
  category: 'cricket' | 'biryani_dawat' | 'chai_pe_charcha' | 'patang_bazi' | 'marfa_housie' | 'swachhta';
  icon: string;
  date: string;
  date_hi?: string;
  date_te?: string;
  time: string;
  time_hi?: string;
  time_te?: string;
  venue: string;
  venue_hi?: string;
  venue_te?: string;
  description: string;
  description_hi?: string;
  description_te?: string;
  highlights: string[];
  highlights_hi?: string[];
  highlights_te?: string[];
  organizer: string;
  attendees: ActivityAttendee[];
  userRsvp: boolean;
  userGuests: number;
  volunteerRoles: ActivityVolunteerRole[];
  chatMessages: {
    id: string;
    author: string;
    text: string;
    text_hi?: string;
    text_te?: string;
    time: string;
  }[];
  imageUrl?: string;
}

export interface InviteTemplate {
  id: string;
  title: string;
  title_hi: string;
  title_te: string;
  category: string;
  language: string;
  message_en: string;
  message_hi: string;
  message_te: string;
}

export interface PollOption {
  id: string;
  text: string;
  text_hi?: string;
  text_te?: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  title_hi?: string;
  title_te?: string;
  description: string;
  description_hi?: string;
  description_te?: string;
  area: LocalArea;
  category: 'budget' | 'parks' | 'traffic' | 'sanitation' | 'general';
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  endDate: string;
  status: 'active' | 'closed';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  action_hi?: string;
  action_te?: string;
  targetId: string;
  targetType: 'complaint' | 'notice' | 'poll' | 'system';
  details: string;
  ipAddress: string;
}

export interface NotificationDispatch {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  channel: 'push' | 'sms' | 'whatsapp';
  targetArea: LocalArea;
  recipientsCount: number;
  status: 'sent' | 'queued' | 'failed';
}

export interface DepartmentMetric {
  department: string;
  totalTickets: number;
  resolvedTickets: number;
  avgSlaHours: number;
  satisfactionScore: number;
}

export interface WardKPIs {
  totalComplaints: number;
  resolvedPercentage: number;
  avgSlaHours: number;
  citizenSatisfactionRating: number;
  activeOfficersCount: number;
}

