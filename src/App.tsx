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
import { 
  INITIAL_COMPLAINTS, 
  INITIAL_NOTICES, 
  INITIAL_ACTIVITIES, 
  INITIAL_POLLS,
  getLocalizedText 
} from './data/mockData';
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

export default function App() {
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

  // Role Switcher State: Citizen | Officer | Admin
  const [activeRole, setActiveRole] = useState<UserRole>('citizen');

  // Senior Citizen / High Accessibility Mode State
  const [seniorCitizenMode, setSeniorCitizenMode] = useState<boolean>(false);

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('community_civic_complaints_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load complaints from storage', e);
    }
    return INITIAL_COMPLAINTS;
  });

  // Notices State
  const [notices, setNotices] = useState<LocalNotice[]>(() => {
    try {
      const saved = localStorage.getItem('community_civic_notices_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load notices from storage', e);
    }
    return INITIAL_NOTICES;
  });

  // Fun Activities State
  const [activities, setActivities] = useState<FunActivity[]>(() => {
    try {
      const saved = localStorage.getItem('community_civic_activities_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load activities from storage', e);
    }
    return INITIAL_ACTIVITIES;
  });

  // Citizen Polls State
  const [polls, setPolls] = useState<Poll[]>(() => {
    try {
      const saved = localStorage.getItem('community_civic_polls_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load polls from storage', e);
    }
    return INITIAL_POLLS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('community_civic_complaints_v4', JSON.stringify(complaints));
    } catch (e) {
      console.warn(e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('community_civic_notices_v4', JSON.stringify(notices));
    } catch (e) {
      console.warn(e);
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem('community_civic_activities_v4', JSON.stringify(activities));
    } catch (e) {
      console.warn(e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('community_civic_polls_v4', JSON.stringify(polls));
    } catch (e) {
      console.warn(e);
    }
  }, [polls]);

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

  // Complaint Upvote ("Affects My Galli Too")
  const handleToggleUpvote = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const userUpvoted = !c.userUpvoted;
          const upvotes = userUpvoted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1);
          return { ...c, userUpvoted, upvotes };
        }
        return c;
      })
    );
    showToast(
      language === 'hi' 
        ? 'आपका समर्थन "हमारी गली भी प्रभावित" दर्ज किया गया!' 
        : language === 'te' 
        ? 'మీ మద్దతు "మా వీధిని కూడా ప్రభావితం చేస్తుంది" నమోదు చేయబడింది!' 
        : 'Your endorsement "Affects My Galli Too" recorded!'
    );
  };

  // Add Comment on Complaint
  const handleAddComment = (
    id: string,
    commentData: Omit<ComplaintComment, 'id' | 'timestamp'>
  ) => {
    const newComment: ComplaintComment = {
      id: `c-${Date.now()}`,
      timestamp: 'Just now',
      ...commentData,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            comments: [newComment, ...c.comments],
          };
        }
        return c;
      })
    );
    showToast(
      language === 'hi' 
        ? 'आपकी टिप्पणी सार्वजनिक शिकायत रिकॉर्ड में जोड़ दी गई है।' 
        : language === 'te' 
        ? 'మీ వ్యాఖ్య ప్రజా ఫిర్యాదుల రికార్డుకు జోడించబడింది.' 
        : 'Your comment has been added to the public grievance record.'
    );
  };

  // Officer Update Status
  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus, notes?: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: newStatus,
            officialResolutionNotes: notes || c.officialResolutionNotes,
            expectedResolution: newStatus === 'resolved' ? 'Paka Resolved Today' : c.expectedResolution,
          };
        }
        return c;
      })
    );
    showToast(`Status updated to: ${newStatus.toUpperCase()}`);
  };

  // File New Complaint
  const handleCreateComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
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
  const handleAddNewNotice = (newNotice: LocalNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
    showToast(
      language === 'hi'
        ? 'नई नागरिक सूचना बोर्ड पर प्रकाशित कर दी गई है!'
        : language === 'te'
        ? 'కొత్త పౌర సమాచారం నోటీసు బోర్డులో ప్రచురించబడింది!'
        : 'New civic notice published to the Community board!'
    );
  };

  // Fun Activity RSVP Toggle
  const handleToggleActivityRsvp = (activityId: string, familyCount: number) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const userRsvp = !act.userRsvp;
          let attendees = act.attendees;
          if (userRsvp) {
            attendees = [{ name: 'Aap aur Gharwale', lane: 'Your Galli', familyCount: familyCount || 3 }, ...attendees];
          } else {
            attendees = attendees.filter((a) => a.name !== 'Aap aur Gharwale');
          }
          return {
            ...act,
            userRsvp,
            userGuests: userRsvp ? (familyCount || 3) : 0,
            attendees,
          };
        }
        return act;
      })
    );
    showToast('Your RSVP has been updated!');
  };

  // Volunteer Signup
  const handleVolunteer = (activityId: string, roleName: string, volunteerName: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const updatedRoles = act.volunteerRoles.map((r) => {
            if (r.roleName === roleName) {
              return {
                ...r,
                assignedVolunteers: [...r.assignedVolunteers, volunteerName],
              };
            }
            return r;
          });
          return { ...act, volunteerRoles: updatedRoles };
        }
        return act;
      })
    );
    showToast(`Shukriya / Dhanyavad ${volunteerName}! You are signed up for "${roleName}".`);
  };

  // Activity Chat Message
  const handleAddActivityChat = (activityId: string, author: string, text: string) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      author,
      text,
      time: 'Just now',
    };
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          return { ...act, chatMessages: [...act.chatMessages, newMsg] };
        }
        return act;
      })
    );
    showToast('Message posted to the discussion wall!');
  };

  // Propose Activity
  const handleProposeActivity = (newAct: FunActivity) => {
    setActivities((prev) => [newAct, ...prev]);
    setActiveTab('activities');
    showToast('New community activity proposed! Neighbors can now RSVP and join.');
  };

  // Vote on Citizen Poll
  const handleVoteOnPoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          });
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            userVotedOptionId: optionId,
            options: updatedOptions,
          };
        }
        return p;
      })
    );
    showToast('Your vote has been cast successfully!');
  };

  // Add Poll from Admin Panel
  const handleAddPoll = (newPoll: Poll) => {
    setPolls((prev) => [newPoll, ...prev]);
    showToast('New Ward Poll Published!');
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
        setActiveRole={setActiveRole}
        language={language}
        setLanguage={setLanguage}
        seniorCitizenMode={seniorCitizenMode}
        setSeniorCitizenMode={setSeniorCitizenMode}
      />

      {/* Main Content Area based on Active Role */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {/* ROLE 1: CITIZEN VIEW */}
        {activeRole === 'citizen' && (
          <>
            {activeTab === 'notices' && (
              <NoticeBoardView
                notices={notices}
                selectedArea={selectedArea}
                onShareNotice={handleShareNotice}
                onAddNewNotice={handleAddNewNotice}
                isStaffMode={false}
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
        {activeRole === 'admin' && (
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

