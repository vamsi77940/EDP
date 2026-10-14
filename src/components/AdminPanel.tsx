import React, { useState } from 'react';
import { 
  Building2, 
  BarChart3, 
  Layers, 
  Radio, 
  FileCode2, 
  Vote, 
  Send, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Globe, 
  Bell, 
  Shield, 
  Smartphone,
  Plus
} from 'lucide-react';
import { AuditLogEntry, DepartmentMetric, Language, LocalArea, NotificationDispatch, Poll, WardKPIs } from '../types';
import { INITIAL_AUDIT_LOGS, INITIAL_DEPARTMENT_METRICS, INITIAL_NOTIFICATIONS, INITIAL_POLLS, INITIAL_WARD_KPIS, LOCAL_AREAS } from '../data/mockData';
import { t } from '../translations';

interface AdminPanelProps {
  language: Language;
  selectedArea: LocalArea;
  polls: Poll[];
  onAddPoll: (poll: Poll) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  selectedArea,
  polls,
  onAddPoll,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'arch' | 'kpis' | 'polls' | 'notif' | 'audit'>('arch');
  const [notifications, setNotifications] = useState<NotificationDispatch[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // New Poll Form State
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOpt1, setNewPollOpt1] = useState('');
  const [newPollOpt2, setNewPollOpt2] = useState('');
  const [newPollOpt3, setNewPollOpt3] = useState('');
  const [newPollArea, setNewPollArea] = useState<LocalArea>('mehdipatnam');

  // Broadcast Notification Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifChannel, setNotifChannel] = useState<'push' | 'sms' | 'whatsapp'>('push');
  const [notifTargetArea, setNotifTargetArea] = useState<LocalArea>('all');

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle || !newPollOpt1 || !newPollOpt2) return;

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      title: newPollTitle,
      description: newPollDesc || 'Ward civic priority vote.',
      area: newPollArea,
      category: 'budget',
      options: [
        { id: `opt-1-${Date.now()}`, text: newPollOpt1, votes: 0 },
        { id: `opt-2-${Date.now()}`, text: newPollOpt2, votes: 0 },
        ...(newPollOpt3 ? [{ id: `opt-3-${Date.now()}`, text: newPollOpt3, votes: 0 }] : []),
      ],
      totalVotes: 0,
      endDate: '2026-10-15',
      status: 'active',
    };

    onAddPoll(newPoll);
    setNewPollTitle('');
    setNewPollDesc('');
    setNewPollOpt1('');
    setNewPollOpt2('');
    setNewPollOpt3('');
    alert('New Ward Poll Published Successfully!');
  };

  const handleDispatchNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    const newNotif: NotificationDispatch = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: notifTitle,
      message: notifMsg,
      channel: notifChannel,
      targetArea: notifTargetArea,
      recipientsCount: notifTargetArea === 'all' ? 45000 : 12500,
      status: 'sent',
    };

    setNotifications([newNotif, ...notifications]);
    
    // Log to Audit Stream
    const audit: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Ward Commissioner Admin',
      actorRole: 'developer',
      action: `BROADCAST_NOTIFICATION_${notifChannel.toUpperCase()}`,
      targetId: newNotif.id,
      targetType: 'system',
      details: `Broadcasted ${notifChannel.toUpperCase()} alert to ${newNotif.recipientsCount} residents.`,
      ipAddress: '14.139.69.2',
    };
    setAuditLogs([audit, ...auditLogs]);

    setNotifTitle('');
    setNotifMsg('');
    alert(`Broadcast Dispatched via ${notifChannel.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      {/* Admin Command Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 ring-4 ring-purple-500/10 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t(language, 'adminPanelHeading')}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full">
                  GHMC Central Command & Executive Oversight
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                {t(language, 'adminPanelSubheading')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-emerald-300 font-bold">SYSTEM ONLINE • PORT 3000</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 flex items-center gap-2 border-t border-purple-800/40 pt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveAdminTab('arch')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'arch'
                ? 'bg-purple-600 text-white shadow-md font-extrabold ring-2 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>{t(language, 'tabArchMap')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('kpis')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'kpis'
                ? 'bg-purple-600 text-white shadow-md font-extrabold ring-2 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{t(language, 'tabKpis')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('polls')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'polls'
                ? 'bg-purple-600 text-white shadow-md font-extrabold ring-2 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Vote className="w-4 h-4 text-amber-400" />
            <span>{t(language, 'tabPollsAdmin')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('notif')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'notif'
                ? 'bg-purple-600 text-white shadow-md font-extrabold ring-2 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4 text-blue-400" />
            <span>{t(language, 'tabNotifAdmin')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'audit'
                ? 'bg-purple-600 text-white shadow-md font-extrabold ring-2 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span>{t(language, 'tabAuditAdmin')}</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ARCHITECTURE MAP VISUALIZER */}
      {activeAdminTab === 'arch' && (
        <div className="bg-slate-950 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-full border border-amber-400/30">
              SYSTEM ARCHITECTURE VISUALIZATION
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white font-serif">
              {t(language, 'archTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {t(language, 'archSub')}
            </p>
          </div>

          {/* Architecture Tree Component matching user request */}
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs text-slate-200">
            {/* Top Node */}
            <div className="flex justify-center">
              <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-sm rounded-xl shadow-lg border border-amber-300">
                MANA WARD
              </div>
            </div>

            {/* Branch to 3 Roles */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-800/90 rounded-xl border border-blue-500/40 text-blue-300">
                <p className="font-bold text-sm">CITIZEN</p>
                <p className="text-[11px] text-slate-400 mt-1">Mobile / Web UI</p>
              </div>
              <div className="p-3 bg-slate-800/90 rounded-xl border border-emerald-500/40 text-emerald-300">
                <p className="font-bold text-sm">OFFICER</p>
                <p className="text-[11px] text-slate-400 mt-1">Officer Panel (AE/Field)</p>
              </div>
              <div className="p-3 bg-slate-800/90 rounded-xl border border-purple-500/40 text-purple-300">
                <p className="font-bold text-sm">ADMIN</p>
                <p className="text-[11px] text-slate-400 mt-1">Admin Executive Command</p>
              </div>
            </div>

            {/* API Gateway */}
            <div className="flex justify-center my-2">
              <div className="px-8 py-3 bg-blue-600 text-white font-extrabold rounded-xl shadow-md border border-blue-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-200" />
                <span>API GATEWAY & LOAD BALANCER</span>
              </div>
            </div>

            {/* Microservices Layer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Auth Service */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> AUTH SERVICE
                </p>
                <p className="text-[11px] text-slate-400">• Role-Based Access Control</p>
                <p className="text-[11px] text-slate-400">• OTP & Citizen Verification</p>
              </div>

              {/* Complaint Service */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> COMPLAINT SERVICE
                </p>
                <div className="pl-2 space-y-1 border-l-2 border-emerald-500/50 text-[11px] text-slate-300">
                  <p>├── AI Severity Predictor</p>
                  <p>├── GIS Mapping & Location</p>
                  <p>├── Media Proof Verification</p>
                  <p>└── SLA Countdown Timers</p>
                </div>
              </div>

              {/* Poll Service */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <p className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Vote className="w-4 h-4" /> POLL SERVICE
                </p>
                <p className="text-[11px] text-slate-400">• Participatory Ward Budgeting</p>
                <p className="text-[11px] text-slate-400">• Live Voting Tally Engine</p>
              </div>
            </div>

            {/* PostgreSQL DB */}
            <div className="flex justify-center">
              <div className="px-8 py-3 bg-emerald-700 text-white font-extrabold rounded-xl shadow-md border border-emerald-400 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-200" />
                <span>PostgreSQL MUNICIPAL DATABASE</span>
              </div>
            </div>

            {/* Downstream Microservices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                <p className="font-bold text-blue-300 mb-1">ANALYTICS</p>
                <ul className="text-[11px] text-slate-400 space-y-0.5">
                  <li>• Ward KPIs & Resolution %</li>
                  <li>• Department Performance</li>
                  <li>• Area Heatmaps & Trends</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                <p className="font-bold text-amber-300 mb-1">NOTIFICATIONS</p>
                <ul className="text-[11px] text-slate-400 space-y-0.5">
                  <li>• Mobile Push Notifications</li>
                  <li>• SMS Gateway Tracker</li>
                  <li>• WhatsApp Broadcasts</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                <p className="font-bold text-rose-300 mb-1">AUDIT LOGS</p>
                <ul className="text-[11px] text-slate-400 space-y-0.5">
                  <li>• Immutable Security Logs</li>
                  <li>• Officer Action Auditing</li>
                  <li>• System Event Traces</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WARD KPIS & HEATMAP */}
      {activeAdminTab === 'kpis' && (
        <div className="space-y-6">
          {/* Top Ward Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-extrabold text-slate-500 uppercase">Total Ward Complaints</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{INITIAL_WARD_KPIS.totalComplaints}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                +12% from last month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <p className="text-xs font-extrabold text-emerald-700 uppercase">Resolution Success Rate</p>
              <p className="text-3xl font-black text-emerald-900 mt-2">{INITIAL_WARD_KPIS.resolvedPercentage}%</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">
                Exceeding 90% SLA Target
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
              <p className="text-xs font-extrabold text-amber-700 uppercase">Average SLA Speed</p>
              <p className="text-3xl font-black text-amber-900 mt-2">{INITIAL_WARD_KPIS.avgSlaHours} Hours</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded">
                Fastest in GHMC South Zone
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs">
              <p className="text-xs font-extrabold text-purple-700 uppercase">Citizen Rating</p>
              <p className="text-3xl font-black text-purple-900 mt-2">{INITIAL_WARD_KPIS.citizenSatisfactionRating} / 5.0 ⭐</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded">
                Based on 1,420 reviews
              </span>
            </div>
          </div>

          {/* Department Breakdown Matrix & Area Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Department Performance Matrix (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Department Performance & SLA Speed Matrix</span>
              </h3>

              <div className="space-y-4">
                {INITIAL_DEPARTMENT_METRICS.map((dept) => {
                  const rate = Math.round((dept.resolvedTickets / dept.totalTickets) * 100);
                  return (
                    <div key={dept.department} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 font-extrabold">{dept.department}</span>
                        <span className="text-emerald-700">{rate}% Resolved ({dept.resolvedTickets}/{dept.totalTickets})</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Avg SLA: {dept.avgSlaHours} Hrs</span>
                        <span>Satisfaction: {dept.satisfactionScore} / 5.0</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ward Area Heatmap & Density (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <span>Ward Area Issue Density (Heatmap)</span>
              </h3>

              <div className="space-y-3">
                {LOCAL_AREAS.filter((a) => a.id !== 'all').map((area) => (
                  <div key={area.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{area.name}</p>
                      <p className="text-[11px] text-slate-500">{area.circleZone}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full">
                      High Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: POLLS MANAGER */}
      {activeAdminTab === 'polls' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Poll Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              <span>Create New Ward Citizen Poll</span>
            </h3>

            <form onSubmit={handleCreatePollSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Poll Title *</label>
                <input
                  type="text"
                  required
                  value={newPollTitle}
                  onChange={(e) => setNewPollTitle(e.target.value)}
                  placeholder="e.g. Participatory Budgeting for Shanti Nagar Park"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPollDesc}
                  onChange={(e) => setNewPollDesc(e.target.value)}
                  placeholder="Describe the voting proposal for ward residents..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Option 1 *</label>
                <input
                  type="text"
                  required
                  value={newPollOpt1}
                  onChange={(e) => setNewPollOpt1(e.target.value)}
                  placeholder="Option 1 text..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Option 2 *</label>
                <input
                  type="text"
                  required
                  value={newPollOpt2}
                  onChange={(e) => setNewPollOpt2(e.target.value)}
                  placeholder="Option 2 text..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Option 3 (Optional)</label>
                <input
                  type="text"
                  value={newPollOpt3}
                  onChange={(e) => setNewPollOpt3(e.target.value)}
                  placeholder="Option 3 text..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                + Publish Poll to Ward Residents
              </button>
            </form>
          </div>

          {/* Active Polls List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-purple-600" />
              <span>Active Ward Polls ({polls.length})</span>
            </h3>

            <div className="space-y-4">
              {polls.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-full uppercase">
                      {p.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Total Votes: {p.totalVotes}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600">{p.description}</p>

                  <div className="space-y-2 pt-2">
                    {p.options.map((opt) => {
                      const pct = p.totalVotes > 0 ? Math.round((opt.votes / p.totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{opt.text}</span>
                            <span className="text-purple-700">{pct}% ({opt.votes})</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NOTIFICATION DISPATCHER */}
      {activeAdminTab === 'notif' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <span>Simulate Ward Broadcast (Push / SMS / WhatsApp)</span>
            </h3>

            <form onSubmit={handleDispatchNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Area</label>
                <select
                  value={notifTargetArea}
                  onChange={(e) => setNotifTargetArea(e.target.value as LocalArea)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {LOCAL_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Channel</label>
                <select
                  value={notifChannel}
                  onChange={(e) => setNotifChannel(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl capitalize font-bold"
                >
                  <option value="push">📱 Mobile Push Notification</option>
                  <option value="sms">💬 SMS Alert Gateway</option>
                  <option value="whatsapp">🟢 WhatsApp Official Broadcast</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Water Pipeline Repair Shutdown Alert"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="Enter details for residents..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                📡 Dispatch Broadcast Alert
              </button>
            </form>
          </div>

          {/* Broadcast Logs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Dispatched Notification History</span>
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 font-extrabold">{n.title}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded uppercase text-[10px]">
                      {n.channel}
                    </span>
                  </div>
                  <p className="text-slate-600">{n.message}</p>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Target: {n.targetArea} ({n.recipientsCount} recipients)</span>
                    <span>{n.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <span>Immutable Administrative & Security Audit Log Stream</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / Officer</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Target ID</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900">{log.actor} ({log.actorRole})</td>
                    <td className="p-3 text-purple-700 font-bold">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.targetId}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
