import React, { useState } from 'react';
import { 
  Bell, 
  Droplets, 
  Hammer, 
  HeartPulse, 
  Trash2, 
  Zap, 
  Clock, 
  MapPin, 
  Share2, 
  PhoneCall, 
  Calendar,
  PlusCircle,
  X
} from 'lucide-react';
import { LocalNotice, LocalArea, Language } from '../types';
import { LOCAL_AREAS, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface NoticeBoardViewProps {
  notices: LocalNotice[];
  selectedArea: LocalArea;
  onShareNotice: (notice: LocalNotice) => void;
  onAddNewNotice: (notice: LocalNotice) => Promise<boolean>;
  isStaffMode: boolean;
  language: Language;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  notices,
  selectedArea,
  onShareNotice,
  onAddNewNotice,
  isStaffMode,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    title_hi: '',
    title_te: '',
    category: 'HMWSSB Water' as LocalNotice['category'],
    areaAffected: 'Mehdipatnam, Tolichowki & Rethibowli',
    scheduledTime: '6:00 AM – 8:30 AM (Alternate Days)',
    date: 'Active from Today',
    details: '',
    contactPerson: 'HMWSSB Ward Helpline: 155313 • AE Er. Azharuddin',
  });

  const categoriesConfig = [
    { id: 'all', label: t(language, 'allNotices'), icon: Bell },
    { 
      id: 'HMWSSB Water', 
      label: language === 'hi' ? 'HMWSSB पेयजल' : language === 'te' ? 'HMWSSB తాగునీరు' : 'HMWSSB Water', 
      icon: Droplets 
    },
    { 
      id: 'GHMC Road Work', 
      label: language === 'hi' ? 'GHMC सड़क निर्माण' : language === 'te' ? 'GHMC రోడ్డు పనులు' : 'GHMC Road Work', 
      icon: Hammer 
    },
    { 
      id: 'TSSPDCL Power', 
      label: language === 'hi' ? 'TSSPDCL विद्युत' : language === 'te' ? 'TSSPDCL విద్యుత్' : 'TSSPDCL Power', 
      icon: Zap 
    },
    { 
      id: 'Health Camp', 
      label: language === 'hi' ? 'स्वास्थ्य एवं स्वच्छता' : language === 'te' ? 'ఆరోగ్య శిబిరం' : 'Health & Fogging', 
      icon: HeartPulse 
    },
  ];

  const filteredNotices = notices.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title.trim() || !newNoticeForm.details.trim()) return;

    const saved = await onAddNewNotice({
      id: `not-${Date.now()}`,
      ...newNoticeForm,
      status: 'Ongoing',
    });
    if (!saved) return;

    setShowAddModal(false);
    setNewNoticeForm({
      title: '',
      title_hi: '',
      title_te: '',
      category: 'HMWSSB Water',
      areaAffected: 'Mehdipatnam, Tolichowki & Rethibowli',
      scheduledTime: '6:00 AM – 8:30 AM (Alternate Days)',
      date: 'Active from Today',
      details: '',
      contactPerson: 'HMWSSB Ward Helpline: 155313 • AE Er. Azharuddin',
    });
  };

  const getCategoryIcon = (category: LocalNotice['category']) => {
    switch (category) {
      case 'HMWSSB Water':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'GHMC Road Work':
        return <Hammer className="w-4 h-4 text-amber-600" />;
      case 'Health Camp':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Swachh Auto':
        return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case 'TSSPDCL Power':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: LocalNotice['status']) => {
    if (status === 'Ongoing') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          ● {t(language, 'noticeStatusOngoing')}
        </span>
      );
    }
    if (status === 'Scheduled') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          🗓️ {t(language, 'noticeStatusScheduled')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        ✓ {t(language, 'noticeStatusCompleted')}
      </span>
    );
  };

  const currentAreaInfo = LOCAL_AREAS.find((a) => a.id === selectedArea) || LOCAL_AREAS[0];

  return (
    <div className="space-y-6">
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded-md">
              {getLocalizedText(currentAreaInfo, 'name', language)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t(language, 'councillor', { name: currentAreaInfo.councillor }) || currentAreaInfo.councillor}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 font-serif">
            {t(language, 'noticesHeading')}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t(language, 'noticesSubheading')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isStaffMode && (
            <button
              type="button"
              id="publish-notice-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer sm:w-auto"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(language, 'publishNoticeBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoriesConfig.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.map((notice) => {
          const displayTitle = getLocalizedText(notice, 'title', language);
          const displayDetails = getLocalizedText(notice, 'details', language);
          const displayArea = getLocalizedText(notice, 'areaAffected', language);
          const displayTime = getLocalizedText(notice, 'scheduledTime', language);
          const displayCat = getLocalizedText(notice, 'category', language);

          return (
            <div
              key={notice.id}
              id={`notice-card-${notice.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Notice Top Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                      {getCategoryIcon(notice.category)}
                    </div>
                    <span className="break-words text-xs font-bold text-slate-700">
                      {displayCat}
                    </span>
                  </div>
                  {getStatusBadge(notice.status)}
                </div>

                {/* Notice Title */}
                <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                  {displayTitle}
                </h3>

                {/* Details */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {displayDetails}
                </p>

                {/* Key Timings & Affected Location */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{t(language, 'timeLabel')}:</span>
                    <span>{displayTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-900">{t(language, 'areaLabelShort')}:</span>
                    <span className="min-w-0 break-words">{displayArea}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                    <PhoneCall className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="min-w-0 break-words">{notice.contactPerson}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {notice.date}
                </span>

                <button
                  type="button"
                  onClick={() => onShareNotice(notice)}
                  className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t(language, 'shareWhatsApp')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 max-h-[calc(100dvh-1rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {t(language, 'publishNoticeBtn')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(event) => {
              setIsSubmitting(true);
              void handleAddSubmit(event).finally(() => setIsSubmitting(false));
            }} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Notice Category
                </label>
                <select
                  value={newNoticeForm.category}
                  onChange={(e) =>
                    setNewNoticeForm({ ...newNoticeForm, category: e.target.value as any })
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                >
                  <option value="HMWSSB Water">HMWSSB Drinking Water</option>
                  <option value="GHMC Road Work">GHMC Road Work / SRDP</option>
                  <option value="TSSPDCL Power">TSSPDCL Power / Streetlight</option>
                  <option value="Health Camp">Entomology Mosquito Fogging</option>
                  <option value="Swachh Auto">Swachh Auto Garbage Schedule</option>
                  <option value="General">General Municipal Notification</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Notice Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                  placeholder="e.g. Low Pressure Drinking Water Supply in Rethibowli"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  शीर्षक (हिन्दी में)
                </label>
                <input
                  type="text"
                  value={newNoticeForm.title_hi}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title_hi: e.target.value })}
                  placeholder="उदा. रेतीबोवली में कम दबाव पर पेयजल आपूर्ति"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  శీర్షిక (తెలుగులో)
                </label>
                <input
                  type="text"
                  value={newNoticeForm.title_te}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title_te: e.target.value })}
                  placeholder="ఉదా. రేతిబౌలిలో తక్కువ పీడనంతో తాగునీటి సరఫరా"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Affected Colonies & Gallis *
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeForm.areaAffected}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, areaAffected: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Supply / Work Timings
                  </label>
                  <input
                    type="text"
                    value={newNoticeForm.scheduledTime}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, scheduledTime: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Date & Duration
                  </label>
                  <input
                    type="text"
                    value={newNoticeForm.date}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Detailed Official Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newNoticeForm.details}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, details: e.target.value })}
                  placeholder="Official advisory to residents..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  AE / Inspector Contact Details
                </label>
                <input
                  type="text"
                  value={newNoticeForm.contactPerson}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, contactPerson: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t(language, 'modalCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? 'Publishing…' : t(language, 'publishNoticeBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
