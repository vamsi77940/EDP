import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  Bell, 
  Inbox, 
  Trophy, 
  Search, 
  AlertTriangle,
  Send,
  Languages,
  UserCheck,
  ShieldCheck,
  Vote,
  Accessibility,
  Check,
  LogOut,
} from 'lucide-react';
import { LocalArea, Language, UserRole } from '../types';
import { LOCAL_AREAS, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface HeaderProps {
  activeTab: 'notices' | 'complaints' | 'polls' | 'activities' | 'invite';
  setActiveTab: (tab: 'notices' | 'complaints' | 'polls' | 'activities' | 'invite') => void;
  selectedArea: LocalArea;
  setSelectedArea: (area: LocalArea) => void;
  onOpenFileComplaint: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openComplaintsCount: number;
  upcomingEventsCount: number;
  activeRole: UserRole;
  userEmail: string;
  onSignOut: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  seniorCitizenMode: boolean;
  setSeniorCitizenMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedArea,
  setSelectedArea,
  onOpenFileComplaint,
  searchQuery,
  setSearchQuery,
  openComplaintsCount,
  activeRole,
  userEmail,
  onSignOut,
  language,
  setLanguage,
  seniorCitizenMode,
  setSeniorCitizenMode,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Municipal Authority, Verified Role & Language Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 py-2 border-b border-slate-800 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Role comes from the authenticated profile and cannot be switched here. */}
          <div className="flex min-w-0 max-w-full items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-amber-400 px-2 uppercase tracking-wider hidden sm:inline">
              ONE GATE
            </span>
            {activeRole === 'citizen' && <UserCheck className="ml-2 h-3.5 w-3.5 text-amber-400" />}
            {activeRole === 'officer' && <ShieldCheck className="ml-2 h-3.5 w-3.5 text-blue-400" />}
            {activeRole === 'developer' && <Building2 className="ml-2 h-3.5 w-3.5 text-purple-400" />}
            <span className="px-1.5 py-2 text-xs font-bold text-white sm:px-2">
              {activeRole === 'citizen' ? t(language, 'roleCitizen') : activeRole === 'officer' ? t(language, 'roleOfficer') : 'Developer'}
            </span>
            <span className="hidden max-w-48 truncate text-slate-400 sm:inline" title={userEmail}>{userEmail}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="ml-1 inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-2 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>

          {/* Right Controls: Senior Citizen Accessibility Toggle & Language Switcher */}
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:gap-4">
            {/* Senior Citizen / High Accessibility Mode Toggle */}
            <button
              type="button"
              id="toggle-senior-mode-btn"
              onClick={() => setSeniorCitizenMode(!seniorCitizenMode)}
              className={`flex min-h-10 items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                seniorCitizenMode
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
              }`}
              title="Toggle Large Font & High Contrast for Senior Citizens"
            >
              <Accessibility className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{seniorCitizenMode ? 'Senior Mode ON' : 'Senior Mode'}</span>
              {seniorCitizenMode && <Check className="w-3 h-3 text-emerald-200" />}
            </button>

            {/* Language Selector (Preserved) */}
            <div             className="flex min-h-10 items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <Languages className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="lang-en-btn"
                  onClick={() => setLanguage('en')}
                  className={`min-h-8 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  id="lang-hi-btn"
                  onClick={() => setLanguage('hi')}
                  className={`min-h-8 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'hi'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="हिन्दी में बदलें"
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  id="lang-te-btn"
                  onClick={() => setLanguage('te')}
                  className={`min-h-8 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'te'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="తెలుగులోకి మార్చండి"
                >
                  తెలుగు
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Branding Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md ring-4 ring-amber-50 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
                  ONE GATE
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md shadow-xs">
                  {t(language, 'circleZoneBadge')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {t(language, 'appTagline')}
              </p>
            </div>
          </div>

          {/* Citizen Controls (Area Picker, Search, File Grievance) */}
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 md:w-auto">
            {/* Area / Circle Selector */}
            <div className="relative">
              <select
                id="area-selector"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as LocalArea)}
                className="min-h-11 w-full text-xs sm:w-auto sm:text-sm font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer pr-8 shadow-xs"
              >
                {LOCAL_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    📍 {getLocalizedText(a, 'name', language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Global Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(language, 'searchPlaceholder')}
                className="min-h-11 w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Lodge Grievance CTA */}
            {(activeRole === 'citizen' || activeRole === 'developer') && (
              <button
                id="file-complaint-cta-btn"
                type="button"
                onClick={onOpenFileComplaint}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs sm:w-auto sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t(language, 'lodgeComplaintBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Citizen Navigation Tabs (Shown when activeRole === 'citizen') */}
        {(activeRole === 'citizen' || activeRole === 'developer') && (
          <nav aria-label="Community sections" className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 overflow-x-auto overscroll-x-contain no-scrollbar sm:mt-4">
            {/* Tab 1: Local Notices */}
            <button
              id="tab-notices-btn"
              type="button"
              onClick={() => setActiveTab('notices')}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'notices'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-2 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{t(language, 'tabNotices')}</span>
            </button>

            {/* Tab 2: Grievance Box */}
            <button
              id="tab-complaints-btn"
              type="button"
              onClick={() => setActiveTab('complaints')}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'complaints'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-2 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>{t(language, 'tabComplaints')}</span>
              {openComplaintsCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-800 font-extrabold">
                  {openComplaintsCount}
                </span>
              )}
            </button>

            {/* Tab 3: Citizen Polls */}
            <button
              id="tab-polls-btn"
              type="button"
              onClick={() => setActiveTab('polls')}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'polls'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-2 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Vote className="w-4 h-4 text-purple-600" />
              <span>{t(language, 'tabPolls')}</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-800 font-bold">
                NEW
              </span>
            </button>

            {/* Tab 4: Fun Activities */}
            <button
              id="tab-activities-btn"
              type="button"
              onClick={() => setActiveTab('activities')}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'activities'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-2 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{t(language, 'tabActivities')}</span>
            </button>

            {/* Tab 5: Invite Neighbors */}
            <button
              id="tab-invite-btn"
              type="button"
              onClick={() => setActiveTab('invite')}
              className={`flex min-h-11 shrink-0 items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'invite'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-2 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{t(language, 'tabInvite')}</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
