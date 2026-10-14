import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Cpu, 
  Camera, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Filter,
  User,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Complaint, ComplaintStatus, Language, LocalArea, SlaStatus } from '../types';
import { COMPLAINT_CATEGORIES, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface OfficerPanelProps {
  complaints: Complaint[];
  onUpdateStatus: (id: string, status: ComplaintStatus, notes?: string) => void;
  language: Language;
  selectedArea: LocalArea;
}

export const OfficerPanel: React.FC<OfficerPanelProps> = ({
  complaints,
  onUpdateStatus,
  language,
  selectedArea,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSlaFilter, setSelectedSlaFilter] = useState<string>('all');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [proofImageUploaded, setProofImageUploaded] = useState<boolean>(false);

  // Filter complaints based on Area, Status, SLA
  const filtered = complaints.filter((c) => {
    if (selectedArea !== 'all' && c.area !== selectedArea) return false;
    if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) return false;
    if (selectedSlaFilter !== 'all') {
      const sla = c.slaStatus || (c.urgency === 'Tatkāl (Emergency)' ? 'approaching_sla' : 'on_track');
      if (sla !== selectedSlaFilter) return false;
    }
    return true;
  });

  const activeTicket = complaints.find((c) => c.id === activeTicketId) || filtered[0] || null;

  const handleApplyResolution = (newStatus: ComplaintStatus) => {
    if (!activeTicket) return;
    onUpdateStatus(activeTicket.id, newStatus, resolutionNotes || 'Field inspection completed & issue resolved.');
    setResolutionNotes('');
    setProofImageUploaded(false);
  };

  return (
    <div className="space-y-6">
      {/* Officer Panel Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 ring-4 ring-blue-500/10 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t(language, 'officerPanelHeading')}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                  GHMC & HMWSSB Field AE Workspace
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                {t(language, 'officerPanelSubheading')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 shrink-0">
            <User className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <p className="font-bold text-white">Er. Rajeshwar Rao (AE)</p>
              <p className="text-slate-400 text-[11px]">Sub-Division #12 • Water & Sanitation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & SLA Counter Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Assigned Complaints</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{complaints.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase">On Track SLA</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">
              {complaints.filter((c) => c.status !== 'resolved' && c.urgency !== 'Tatkāl (Emergency)').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase">Tatkāl Approaching SLA</p>
            <p className="text-2xl font-black text-amber-900 mt-1">
              {complaints.filter((c) => c.urgency === 'Tatkāl (Emergency)' && c.status !== 'resolved').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-700 uppercase">AI Auto-Tagged</p>
            <p className="text-2xl font-black text-purple-900 mt-1">100%</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Panel Layout: Complaint Queue & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Ticket Queue ({filtered.length})</span>
              </h3>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="field_work">Field Work</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((c) => {
                const isSelected = activeTicket?.id === c.id;
                const cat = COMPLAINT_CATEGORIES.find((cat) => cat.id === c.category);
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveTicketId(c.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        #{c.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          c.urgency === 'Tatkāl (Emergency)'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.urgency}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1">
                      {getLocalizedText(c, 'title', language)}
                    </h4>

                    <div className="flex items-center justify-between mt-2.5 text-[11px]">
                      <span className="text-slate-500 font-medium truncate max-w-[180px]">
                        📍 {getLocalizedText(c, 'locationDetails', language)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold capitalize ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'field_work'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Inspection & Officer Actions (7 cols) */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Ticket Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-900 text-amber-400 font-mono text-xs font-bold rounded-lg">
                      #{activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Filed by: {activeTicket.filedBy} ({activeTicket.filedPhone || '+91 98490 12345'})
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {getLocalizedText(activeTicket, 'title', language)}
                  </h3>
                </div>

                <a
                  href={`tel:${activeTicket.filedPhone || '040-2111-1111'}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t(language, 'callCitizenBtn')}</span>
                </a>
              </div>

              {/* SLA & AI Auto-Categorization Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* SLA Clock */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t(language, 'slaTimeRemaining')}</p>
                    <p className="text-sm font-black text-amber-900 mt-0.5">
                      {activeTicket.urgency === 'Tatkāl (Emergency)' ? '3 Hours 45 Mins (Urgent)' : '18 Hours (On Track)'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Target: {activeTicket.expectedResolution}</p>
                  </div>
                </div>

                {/* AI Categorization & GIS Coordinates */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-500">AI Service Categorization</p>
                      <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 text-[10px] font-bold rounded">
                        98% Match
                      </span>
                    </div>
                    <p className="text-xs font-bold text-purple-900 mt-0.5 capitalize">
                      {activeTicket.category.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500 inline" />
                      Lat: {activeTicket.latitude || 17.3916}, Long: {activeTicket.longitude || 78.4385}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complaint Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Citizen Reported Details
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">
                    📍 {getLocalizedText(activeTicket, 'locationDetails', language)}
                  </p>
                  <p>{getLocalizedText(activeTicket, 'description', language)}</p>
                </div>
              </div>

              {/* Status Progression Controls & Work Proof Upload */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Officer Action & Field Progression
                </h4>

                {/* Resolution Notes Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Field Inspection Notes / Action Taken Log
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter official resolution details, repair gang deployment summary, or status update..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Proof Image Upload Simulator */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Upload Media Proof of Work</p>
                      <p className="text-[11px] text-slate-500">Attach site photo after repair completion</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProofImageUploaded(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      proofImageUploaded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {proofImageUploaded ? '✓ Photo Verified' : '📷 Attach Site Photo'}
                  </button>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyResolution('assigned')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Set Assigned
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyResolution('field_work')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Deploy Field Work Gang
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyResolution('resolved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm cursor-pointer ml-auto"
                  >
                    ✓ Mark Fully Resolved (Paka Resolved)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              Select a complaint ticket to view officer SLA controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
