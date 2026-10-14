import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Coffee, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  PlusCircle, 
  CheckCircle2, 
  Smile, 
  Send, 
  UserCheck, 
  X
} from 'lucide-react';
import { FunActivity, Language } from '../types';
import { getLocalizedText, getLocalizedArray } from '../data/mockData';
import { t } from '../translations';

interface ActivityPlannerViewProps {
  activities: FunActivity[];
  onToggleRsvp: (activityId: string, familyCount: number) => void;
  onVolunteer: (activityId: string, roleName: string, volunteerName: string) => void;
  onAddChatMessage: (activityId: string, author: string, text: string) => void;
  onProposeActivity: (activity: FunActivity) => Promise<boolean>;
  onShareActivity: (activity: FunActivity) => void;
  language: Language;
}

export const ActivityPlannerView: React.FC<ActivityPlannerViewProps> = ({
  activities,
  onToggleRsvp,
  onVolunteer,
  onAddChatMessage,
  onProposeActivity,
  onShareActivity,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [chatInputs, setChatInputs] = useState<Record<string, { author: string; text: string }>>({});
  const [volunteerInputs, setVolunteerInputs] = useState<Record<string, string>>({});

  // Propose Activity Form State
  const [proposeForm, setProposeForm] = useState({
    title: '',
    title_hi: '',
    title_te: '',
    tagline: '',
    category: 'cricket' as FunActivity['category'],
    date: 'Upcoming Sunday',
    time: '7:00 AM – 12:00 PM',
    venue: 'Gymkhana Grounds / Community Ground',
    description: '',
    organizer: '',
    highlights: '6-Overs box cricket, Cutting Irani Chai & Osmania Biscuits on boundary line',
  });

  const filteredActivities = activities.filter((act) => {
    if (selectedCategory !== 'all' && act.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeForm.title.trim() || !proposeForm.description.trim()) return;

    const newAct: FunActivity = {
      id: `act-${Date.now()}`,
      title: proposeForm.title.trim(),
      title_hi: proposeForm.title_hi.trim() || proposeForm.title.trim(),
      title_te: proposeForm.title_te.trim() || proposeForm.title.trim(),
      tagline: proposeForm.tagline.trim() || 'Community celebration & gathering!',
      category: proposeForm.category,
      icon: 'Trophy',
      date: proposeForm.date,
      time: proposeForm.time,
      venue: proposeForm.venue,
      description: proposeForm.description,
      highlights: proposeForm.highlights.split(',').map((h) => h.trim()),
      organizer: proposeForm.organizer.trim() || 'Community Resident Samiti',
      attendees: [{ name: proposeForm.organizer || 'Organizer', lane: 'Ward 72', familyCount: 4 }],
      userRsvp: true,
      userGuests: 3,
      volunteerRoles: [
        { roleName: 'Refreshment & Chai Desk', requiredCount: 2, assignedVolunteers: [] },
        { roleName: 'Event Marshal & Welcome', requiredCount: 2, assignedVolunteers: [proposeForm.organizer || 'You'] },
      ],
      chatMessages: [
        {
          id: `m-init-${Date.now()}`,
          author: proposeForm.organizer || 'Organizer',
          text: 'Event proposed! Please RSVP with family and share your suggestions here!',
          time: 'Just now',
        },
      ],
    };

    const saved = await onProposeActivity(newAct);
    if (!saved) return;
    setShowProposeModal(false);
    setProposeForm({
      title: '',
      title_hi: '',
      title_te: '',
      tagline: '',
      category: 'cricket',
      date: 'Upcoming Sunday',
      time: '7:00 AM – 12:00 PM',
      venue: 'Gymkhana Grounds / Community Ground',
      description: '',
      organizer: '',
      highlights: '6-Overs box cricket, Cutting Irani Chai & Osmania Biscuits on boundary line',
    });
  };

  const handleChatSubmit = (actId: string, e: React.FormEvent) => {
    e.preventDefault();
    const input = chatInputs[actId];
    if (!input || !input.text.trim()) return;

    onAddChatMessage(actId, input.author.trim() || 'Resident', input.text.trim());
    setChatInputs((prev) => ({
      ...prev,
      [actId]: { author: '', text: '' },
    }));
  };

  const handleVolunteerSubmit = (actId: string, roleName: string) => {
    const key = `${actId}_${roleName}`;
    const name = volunteerInputs[key];
    if (!name || !name.trim()) return;

    onVolunteer(actId, roleName, name.trim());
    setVolunteerInputs((prev) => ({ ...prev, [key]: '' }));
  };

  const categories = [
    { id: 'all', label: t(language, 'allActivities'), icon: Trophy },
    { id: 'cricket', label: t(language, 'catCricket'), icon: Trophy },
    { id: 'biryani_dawat', label: t(language, 'catBiryani'), icon: Flame },
    { id: 'chai_pe_charcha', label: t(language, 'catChai'), icon: Coffee },
    { id: 'patang_bazi', label: t(language, 'catPatang'), icon: Sparkles },
  ];

  const communityStats = [
    { label: t(language, 'activeMembers'), value: '2.4K' },
    { label: t(language, 'upcomingEvents'), value: `${activities.length}` },
    { label: t(language, 'volunteerHours'), value: '860+' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-xs border border-white/20 inline-block mb-2">
                ✨ {t(language, 'tabActivities')}
              </span>
              <h2 className="text-2xl font-bold font-serif leading-tight">
                {t(language, 'activitiesHeading')}
              </h2>
              <p className="text-amber-100 text-xs mt-2 leading-relaxed">
                {t(language, 'activitiesSubheading')}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(true)}
                  className="min-h-11 px-4 py-2 bg-white text-slate-900 hover:bg-amber-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-600" />
                  <span>{t(language, 'createActivity')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => activities[0] && onShareActivity(activities[0])}
                  className="min-h-11 px-4 py-2 border border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{t(language, 'inviteFriends')}</span>
                </button>
              </div>
            </div>

            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100 mb-2 font-bold">
                {t(language, 'activityQuickStats')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {communityStats.map((stat) => (
                  <div key={stat.label} className="min-w-0 bg-white/10 border border-white/20 rounded-2xl p-2 sm:p-3 backdrop-blur-sm">
                    <div className="text-lg font-extrabold text-white">{stat.value}</div>
                    <div className="text-[10px] text-amber-100 mt-1 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Feed */}
      <div className="space-y-6">
        {filteredActivities.map((act) => {
          const totalHeadcount = act.attendees.reduce((sum, a) => sum + (a.familyCount || 1), 0);
          const chatInput = chatInputs[act.id] || { author: '', text: '' };

          const displayTitle = getLocalizedText(act, 'title', language);
          const displayTagline = getLocalizedText(act, 'tagline', language);
          const displayDesc = getLocalizedText(act, 'description', language);
          const displayVenue = getLocalizedText(act, 'venue', language);
          const displayDate = getLocalizedText(act, 'date', language);
          const displayTime = getLocalizedText(act, 'time', language);
          const displayHighlights = getLocalizedArray(act, 'highlights', language);

          return (
            <div
              key={act.id}
              id={`activity-card-${act.id}`}
              className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:border-amber-300 transition-all"
            >
              {/* Top Title & Metadata */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="max-w-full break-words px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {act.category.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      By: <strong className="text-slate-700">{act.organizer}</strong>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">
                    {displayTitle}
                  </h3>
                  <p className="text-xs font-medium text-amber-800">
                    {displayTagline}
                  </p>
                </div>

                {/* Share Dawat on WhatsApp */}
                <button
                  type="button"
                  onClick={() => onShareActivity(act)}
                  className="inline-flex min-h-11 items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t(language, 'dawatWhatsApp')}</span>
                </button>
              </div>

              {/* Event Time, Date & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                    <span className="font-bold">{displayDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Time</span>
                    <span className="font-bold">{displayTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Venue</span>
                    <span className="font-bold truncate">{displayVenue}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-700 leading-relaxed">
                {displayDesc}
              </p>

              {/* Highlights & Fun Rules */}
              {displayHighlights.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                    {t(language, 'highlightsHeading')}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
                    {displayHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* RSVP & Headcount Action Box */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {totalHeadcount} {t(language, 'padosisAttending')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {t(language, 'fromAcrossColonies')}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                  {act.userRsvp ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        {t(language, 'rsvpdBadge', { count: act.userGuests })}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleRsvp(act.id, 0)}
                        className="min-h-11 text-left text-xs text-rose-600 hover:text-rose-800 underline font-medium cursor-pointer"
                      >
                        {t(language, 'changeRsvp')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onToggleRsvp(act.id, 3)}
                        className="min-h-11 w-full justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer sm:w-auto"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>{t(language, 'rsvpBtn')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Community Volunteer Roles */}
              {act.volunteerRoles && act.volunteerRoles.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>{t(language, 'volunteerRolesHeading')}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {t(language, 'volunteerSubtext')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {act.volunteerRoles.map((role) => {
                      const displayRoleName = getLocalizedText(role, 'roleName', language);
                      const isFull = role.assignedVolunteers.length >= role.requiredCount;
                      const inputKey = `${act.id}_${role.roleName}`;
                      const inputValue = volunteerInputs[inputKey] || '';

                      return (
                        <div
                          key={role.roleName}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{displayRoleName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {role.assignedVolunteers.length}/{role.requiredCount} {isFull ? t(language, 'roleFilled') : ''}
                              </span>
                            </div>

                            {role.assignedVolunteers.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                Signed up: <strong className="text-slate-700">{role.assignedVolunteers.join(', ')}</strong>
                              </p>
                            )}
                          </div>

                          {!isFull && (
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-1.5">
                              <input
                                type="text"
                                value={inputValue}
                                onChange={(e) =>
                                  setVolunteerInputs({ ...volunteerInputs, [inputKey]: e.target.value })
                                }
                                placeholder={t(language, 'volunteerNamePh')}
                                className="min-h-11 min-w-0 flex-1 p-2 text-xs border border-slate-200 rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleVolunteerSubmit(act.id, role.roleName)}
                                className="min-h-11 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                              >
                                {t(language, 'volunteerBtn')}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discussion & Hype Chat */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{t(language, 'hypeWallHeading')}</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {act.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <strong className="text-slate-900">{msg.author}:</strong>{' '}
                        <span className="text-slate-700">{getLocalizedText(msg, 'text', language)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleChatSubmit(act.id, e)} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    required
                    value={chatInput.text}
                    onChange={(e) =>
                      setChatInputs({
                        ...chatInputs,
                        [act.id]: { ...chatInput, text: e.target.value },
                      })
                    }
                    placeholder={t(language, 'sayExcitingPh')}
                    className="min-h-11 min-w-0 flex-1 p-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer sm:w-auto"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t(language, 'postBtn')}</span>
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Propose Activity Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 my-2 sm:my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {t(language, 'proposeModalTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(event) => {
              setIsSubmittingProposal(true);
              void handleProposeSubmit(event).finally(() => setIsSubmittingProposal(false));
            }} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  {t(language, 'proposeTitleLabel')} (English)
                </label>
                <input
                  type="text"
                  required
                  value={proposeForm.title}
                  onChange={(e) => setProposeForm({ ...proposeForm, title: e.target.value })}
                  placeholder="e.g. Sunday Morning Box Cricket Championship"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  शीर्षक (हिन्दी में)
                </label>
                <input
                  type="text"
                  value={proposeForm.title_hi}
                  onChange={(e) => setProposeForm({ ...proposeForm, title_hi: e.target.value })}
                  placeholder="उदा. संडे गली क्रिकेट चैंपियनशिप"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  శీర్షిక (తెలుగులో)
                </label>
                <input
                  type="text"
                  value={proposeForm.title_te}
                  onChange={(e) => setProposeForm({ ...proposeForm, title_te: e.target.value })}
                  placeholder="ఉదా. సండే గల్లీ క్రికెట్ ఛాంపియన్‌షిప్"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t(language, 'proposeDateLabel')}
                  </label>
                  <input
                    type="text"
                    value={proposeForm.date}
                    onChange={(e) => setProposeForm({ ...proposeForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {t(language, 'proposeTimeLabel')}
                  </label>
                  <input
                    type="text"
                    value={proposeForm.time}
                    onChange={(e) => setProposeForm({ ...proposeForm, time: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  {t(language, 'proposeVenueLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={proposeForm.venue}
                  onChange={(e) => setProposeForm({ ...proposeForm, venue: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  {t(language, 'proposeDescLabel')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={proposeForm.description}
                  onChange={(e) => setProposeForm({ ...proposeForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  {t(language, 'proposeOrganizerLabel')}
                </label>
                <input
                  type="text"
                  value={proposeForm.organizer}
                  onChange={(e) => setProposeForm({ ...proposeForm, organizer: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-medium cursor-pointer"
                >
                  {t(language, 'modalCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="min-h-11 w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  {isSubmittingProposal ? 'Submitting…' : t(language, 'publishActivityBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
