import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  PhoneCall, 
  ChevronDown, 
  Send, 
  PlusCircle, 
  ShieldCheck, 
  Building 
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus, ComplaintComment, LocalArea, Language } from '../types';
import { COMPLAINT_CATEGORIES, STATUS_CONFIG, LOCAL_AREAS, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface ComplaintsViewProps {
  complaints: Complaint[];
  selectedArea: LocalArea;
  onOpenNewComplaint: () => void;
  onToggleUpvote: (id: string) => void;
  onAddComment: (id: string, comment: Omit<ComplaintComment, 'id' | 'timestamp'>) => void;
  onUpdateStatus?: (id: string, status: ComplaintStatus, notes?: string) => void;
  onShareComplaint: (complaint: Complaint) => void;
  isStaffMode: boolean;
  language: Language;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints,
  selectedArea,
  onOpenNewComplaint,
  onToggleUpvote,
  onAddComment,
  onUpdateStatus,
  onShareComplaint,
  isStaffMode,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  // New comment input state per item
  const [commentInputs, setCommentInputs] = useState<Record<string, { name: string; lane: string; text: string }>>({});

  const filteredComplaints = complaints.filter((c) => {
    if (selectedArea !== 'all' && c.area !== selectedArea) {
      return false;
    }
    if (selectedCategory !== 'all' && c.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && c.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || '').toLowerCase().includes(q) || (c.title_hi || '').toLowerCase().includes(q) || (c.title_te || '').toLowerCase().includes(q);
      const matchTicket = c.ticketNumber.toLowerCase().includes(q);
      const matchLoc = (c.locationDetails || '').toLowerCase().includes(q);
      const matchOfficer = c.assignedOfficer.name.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchLoc && !matchOfficer) return false;
    }
    return true;
  });

  const total = complaints.length;
  const inField = complaints.filter((c) => c.status === 'field_work' || c.status === 'assigned').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const handleCommentSubmit = (complaintId: string, e: React.FormEvent) => {
    e.preventDefault();
    const input = commentInputs[complaintId];
    if (!input || !input.text.trim()) return;

    onAddComment(complaintId, {
      authorName: input.name.trim() || 'Resident',
      authorLane: input.lane.trim() || 'Local Lane',
      text: input.text.trim(),
      isOfficer: isStaffMode,
    });

    setCommentInputs((prev) => ({
      ...prev,
      [complaintId]: { name: '', lane: '', text: '' },
    }));
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency.includes('Emergency') || urgency.includes('Tatkāl')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          {t(language, 'emergencyUrgency')}
        </span>
      );
    }
    if (urgency.includes('Zaroori') || urgency.includes('Moderate')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          {t(language, 'urgencyModerate')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
        {t(language, 'urgencyRoutine')}
      </span>
    );
  };

  const renderStatusStepTracker = (currentStatus: ComplaintStatus) => {
    const steps: { key: ComplaintStatus; num: number }[] = [
      { key: 'submitted', num: 1 },
      { key: 'assigned', num: 2 },
      { key: 'field_work', num: 3 },
      { key: 'resolved', num: 4 },
    ];

    const currentStepConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.submitted;
    const currentStepNum = currentStepConfig.step;

    return (
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
          <span>{t(language, 'step1')}: {t(language, 'step1')}</span>
          <span>{t(language, 'step4')}: {t(language, 'step4')}</span>
        </div>

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((s) => {
            const isCompleted = s.num <= currentStepNum;
            const isCurrent = s.num === currentStepNum;
            const config = STATUS_CONFIG[s.key];
            const displayLabel = getLocalizedText(config, 'label', language);

            return (
              <div key={s.key} className="flex flex-col gap-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCompleted
                      ? isCurrent && s.key !== 'resolved'
                        ? 'bg-amber-500 animate-pulse'
                        : s.key === 'resolved'
                        ? 'bg-emerald-600'
                        : 'bg-amber-600'
                      : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium truncate ${
                    isCurrent ? 'font-bold text-slate-950' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                  title={displayLabel}
                >
                  {s.num}. {displayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Transparency KPI Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                📬 {t(language, 'tabComplaints')}
              </span>
              <span className="text-slate-400 text-xs">• 100% Status Transparency</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">
              {t(language, 'complaintsHeading')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {t(language, 'complaintsSubheading')}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewComplaint}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-center cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t(language, 'lodgeComplaintBtn')}</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">{t(language, 'metricTotal')}</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{total}</span>
            <span className="text-[10px] text-slate-400">GHMC & HMWSSB</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-900 font-medium block">{t(language, 'metricField')}</span>
            <span className="text-2xl font-bold text-amber-950 mt-0.5 block">{inField}</span>
            <span className="text-[10px] text-amber-800 font-semibold">Active Inspections</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-900 font-medium block">{t(language, 'metricResolved')}</span>
            <span className="text-2xl font-bold text-emerald-950 mt-0.5 block">{resolvedCount}</span>
            <span className="text-[10px] text-emerald-800 font-semibold">Resident Verified</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-xs text-blue-900 font-medium block">{t(language, 'metricSpeedLabel')}</span>
            <span className="text-2xl font-bold text-blue-950 mt-0.5 block">{t(language, 'metricSpeed')}</span>
            <span className="text-[10px] text-blue-800">Citizen Charter Avg</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs flex-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="all">{t(language, 'allCategories')}</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getLocalizedText(cat, 'name', language)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="all">{t(language, 'allStatuses')}</option>
            <option value="submitted">1. {t(language, 'step1')}</option>
            <option value="assigned">2. {t(language, 'step2')}</option>
            <option value="field_work">3. {t(language, 'step3')}</option>
            <option value="resolved">4. {t(language, 'step4')}</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(language, 'searchPlaceholder')}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {t(language, 'noComplaintsFound')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Clear filters or be the first to report an issue for prompt municipal action.
            </p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            const categoryConfig = COMPLAINT_CATEGORIES.find((c) => c.id === complaint.category);
            const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.submitted;
            const isCommentsExpanded = expandedCommentsId === complaint.id;
            const commentInput = commentInputs[complaint.id] || { name: '', lane: '', text: '' };

            const displayTitle = getLocalizedText(complaint, 'title', language);
            const displayDesc = getLocalizedText(complaint, 'description', language);
            const displayLocation = getLocalizedText(complaint, 'locationDetails', language);
            const displayResolution = getLocalizedText(complaint, 'expectedResolution', language);
            const displayOfficialNotes = getLocalizedText(complaint, 'officialResolutionNotes', language);
            const displayCategoryName = categoryConfig ? getLocalizedText(categoryConfig, 'name', language) : complaint.category;
            const displayOfficerDesignation = getLocalizedText(complaint.assignedOfficer, 'designation', language);
            const displayOfficerDepartment = getLocalizedText(complaint.assignedOfficer, 'department', language);

            return (
              <div
                key={complaint.id}
                id={`complaint-card-${complaint.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header Row: Ticket ID, Category & Urgency */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                      {complaint.ticketNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${categoryConfig?.colorClass || 'bg-slate-100 text-slate-800'}`}>
                      {displayCategoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(complaint.urgency)}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}>
                      {getLocalizedText(statusConfig, 'label', language)}
                    </span>
                  </div>
                </div>

                {/* Complaint Title & Description */}
                <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {displayDesc}
                </p>

                {/* 4-Step Life-Cycle Tracker */}
                {renderStatusStepTracker(complaint.status)}

                {/* Designated Assistant Engineer & Contact Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Officer Info */}
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t(language, 'designatedOfficer')}:</span>
                    </div>
                    <p className="font-bold text-slate-900">{complaint.assignedOfficer.name}</p>
                    <p className="text-[11px] text-slate-600">
                      {displayOfficerDesignation} • {displayOfficerDepartment}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={`tel:${complaint.assignedOfficer.contactPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300/80 px-2 py-1 rounded-md transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{complaint.assignedOfficer.contactPhone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Location, Target Timeline & Official Notes */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">
                        📍 {t(language, 'locationTimeline')}:
                      </span>
                      <p className="text-slate-800">{displayLocation}</p>
                      <div className="flex items-center gap-1 text-slate-500 mt-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{t(language, 'targetResolution')}: <strong className="text-slate-800">{displayResolution}</strong></span>
                      </div>
                    </div>

                    {displayOfficialNotes && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block mb-0.5">{t(language, 'officialNotes')}:</strong>
                        <span>{displayOfficialNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Staff Control Mode: Update Status */}
                {isStaffMode && onUpdateStatus && (
                  <div className="mt-3 p-3 bg-amber-100/50 rounded-xl border border-amber-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      {t(language, 'officerControls')}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(complaint.id, 'assigned', 'AE site inspection scheduled.')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md font-semibold text-[11px] cursor-pointer"
                      >
                        {t(language, 'assignAe')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(complaint.id, 'field_work', 'Municipal machinery and labor deployed.')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-[11px] cursor-pointer"
                      >
                        {t(language, 'fieldWork')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(complaint.id, 'resolved', 'Paka resolved on site and verified.')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[11px] cursor-pointer"
                      >
                        {t(language, 'markResolved')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Resident Action Bar: Upvote ("Affects My Galli"), Comment & WhatsApp */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => onToggleUpvote(complaint.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        complaint.userUpvoted
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${complaint.userUpvoted ? 'fill-white' : ''}`} />
                      <span>{t(language, 'upvoteBtn')} ({complaint.upvotes})</span>
                    </button>

                    {/* Comments Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCommentsId(isCommentsExpanded ? null : complaint.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t(language, 'commentsBtn')} ({complaint.comments.length})</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isCommentsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Share on WhatsApp */}
                  <button
                    type="button"
                    onClick={() => onShareComplaint(complaint)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t(language, 'shareWhatsApp')}</span>
                  </button>
                </div>

                {/* Expanded Public Comments Thread */}
                {isCommentsExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 font-serif">
                      💬 {t(language, 'commentsBtn')}:
                    </h4>

                    {complaint.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No comments yet. Share your ground report below.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {complaint.comments.map((cmt) => (
                          <div
                            key={cmt.id}
                            className={`p-3 rounded-xl text-xs ${
                              cmt.isOfficer
                                ? 'bg-amber-50/90 border border-amber-200'
                                : 'bg-slate-50 border border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">
                                {cmt.authorName}{' '}
                                <span className="font-normal text-slate-500">
                                  ({cmt.authorLane})
                                </span>
                                {cmt.isOfficer && (
                                  <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                                    Official Response
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {cmt.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {getLocalizedText(cmt, 'text', language)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Form */}
                    <form
                      onSubmit={(e) => handleCommentSubmit(complaint.id, e)}
                      className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={commentInput.name}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [complaint.id]: {
                                ...commentInput,
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder={t(language, 'commentNamePlaceholder')}
                          className="p-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                        <input
                          type="text"
                          required
                          value={commentInput.lane}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [complaint.id]: {
                                ...commentInput,
                                lane: e.target.value,
                              },
                            })
                          }
                          placeholder={t(language, 'commentLanePlaceholder')}
                          className="p-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={commentInput.text}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [complaint.id]: {
                                ...commentInput,
                                text: e.target.value,
                              },
                            })
                          }
                          placeholder={t(language, 'commentTextPlaceholder')}
                          className="flex-1 p-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t(language, 'postCommentBtn')}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
