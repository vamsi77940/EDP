import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  Printer, 
  Building2, 
  Users, 
  QrCode, 
  Coffee 
} from 'lucide-react';
import { InviteTemplate, Language } from '../types';
import { INVITE_TEMPLATES, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface InviteViewProps {
  onShowToast: (msg: string) => void;
  language: Language;
}

export const InviteView: React.FC<InviteViewProps> = ({ onShowToast, language }) => {
  const [templates] = useState<InviteTemplate[]>(INVITE_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  
  const getTemplateMessage = (template: InviteTemplate, lang: Language) => {
    if (lang === 'hi') return template.message_hi || template.message_en;
    if (lang === 'te') return template.message_te || template.message_en;
    return template.message_en;
  };

  const currentMessageText = isCustomMode 
    ? customMessage 
    : getTemplateMessage(activeTemplate, language);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    onShowToast(t(language, 'copiedToast'));
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppSend = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    onShowToast('Opening WhatsApp...');
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold">
              📱 {t(language, 'tabInvite')}
            </span>
            <span className="text-amber-300 text-xs">• 1-Click WhatsApp Sharing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            {t(language, 'inviteHeading')}
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl leading-relaxed">
            {t(language, 'inviteSubheading')}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintFlyer}
          className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-center cursor-pointer whitespace-nowrap"
        >
          <Printer className="w-4 h-4 text-amber-700" />
          <span>{t(language, 'printPosterBtn')}</span>
        </button>
      </div>

      {/* Two Column Layout: Template Selector & WhatsApp Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{t(language, 'selectInvitePurpose')}</span>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(!isCustomMode);
                if (!customMessage) {
                  setCustomMessage(
                    `🇮🇳 *Namaste / Adaab!*\n\nPlease join our Community Civic Portal:\nhttps://community-civic.app/?circle=ward72`
                  );
                }
              }}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              {isCustomMode ? t(language, 'usePreMade') : t(language, 'writeCustom')}
            </button>
          </div>

          {!isCustomMode ? (
            templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              const displayTitle = getLocalizedText(tpl, 'title', language);
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {tpl.language}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 font-serif">
                    {displayTitle}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-sans">
                    {getTemplateMessage(tpl, language).replace(/\n/g, ' ')}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-900 block">
                Your Custom Message Text:
              </label>
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your invitation..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp Mock Preview (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-bold text-slate-800">
                {t(language, 'whatsAppPreview')}
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {t(language, 'whatsAppReady')}
              </span>
            </div>

            {/* Mock WhatsApp Bubble */}
            <div className="bg-[#EFEAE2] p-4 sm:p-6 rounded-2xl border border-slate-200/80 max-w-lg mx-auto shadow-inner relative">
              <div className="bg-white p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 space-y-2 whitespace-pre-line font-sans leading-relaxed border border-slate-100">
                {currentMessageText}
              </div>

              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                <span>10:30 AM</span>
                <span className="text-blue-500 font-bold">✓✓</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleCopy(currentMessageText, activeTemplate.id)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === activeTemplate.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t(language, 'copiedToast')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>{t(language, 'copyMessage')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppSend(currentMessageText)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t(language, 'sendWhatsAppBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Poster Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              {t(language, 'posterHeading')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(language, 'posterSubheading')}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintFlyer}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{t(language, 'printA4Btn')}</span>
          </button>
        </div>

        {/* Poster Mock / Print Canvas */}
        <div
          id="printable-flyer"
          className="mt-6 border-4 border-slate-900 rounded-2xl p-6 sm:p-8 bg-white max-w-xl mx-auto text-center space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{t(language, 'footerSub')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight font-serif">
            {t(language, 'appName')}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-md mx-auto">
            {t(language, 'appTagline')}
          </p>

          <div className="my-4 py-4 px-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">
            <QrCode className="w-24 h-24 text-slate-900 mx-auto" />
            <span className="text-[11px] font-bold text-slate-700 mt-2 font-mono">
              {t(language, 'scanToJoin')}
            </span>
            <span className="text-[10px] text-amber-700 font-mono mt-0.5">
              https://community-civic.app/?ward=72
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left text-xs font-medium text-slate-800 border-t border-b border-slate-200 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{t(language, 'tabNotices')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{t(language, 'tabComplaints')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{t(language, 'tabActivities')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{t(language, 'tabInvite')}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            <span>{t(language, 'seniorHelpline')} </span>
            <strong className="text-slate-900 font-mono">GHMC 040-2111-1111 | HMWSSB 155313</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
