import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Complaint, ComplaintCategory, LocalArea, Language } from '../types';
import { COMPLAINT_CATEGORIES, LOCAL_AREAS, getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (complaint: Complaint) => void;
  defaultArea: LocalArea;
  language: Language;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultArea,
  language,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('hmwssb_water');
  const [area, setArea] = useState<LocalArea>(defaultArea === 'all' ? 'mehdipatnam' : defaultArea);
  const [title, setTitle] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Tatkāl (Emergency)' | 'Zaroori (Moderate)' | 'Routine'>('Zaroori (Moderate)');
  const [filedBy, setFiledBy] = useState('');
  const [filedPhone, setFiledPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !filedBy.trim()) return;

    // Auto assign municipal officer based on category
    let officer = {
      name: 'Er. Mohammed Azharuddin',
      designation: 'Assistant Engineer (AE) Water Supply',
      designation_hi: 'सहायक अभियंता (जल आपूर्ति)',
      designation_te: 'అసిస్టెంట్ ఇంజనీర్ (తాగునీటి విభాగం)',
      department: 'HMWSSB Operation & Maintenance Div. VII',
      department_hi: 'HMWSSB जल बोर्ड डिवीजन VII',
      department_te: 'HMWSSB వాటర్ బోర్డు డివిజన్ VII',
      contactPhone: '+91 98499 11223',
    };

    if (category === 'ghmc_sanitation') {
      officer = {
        name: 'Shaik Moinuddin',
        designation: 'Ward Sanitary Field Inspector (SFI)',
        designation_hi: 'स्वच्छता फील्ड निरीक्षक (SFI)',
        designation_te: 'పారిశుధ్య ఫీల్డ్ ఇన్స్పెక్టర్ (SFI)',
        department: 'GHMC South Zone Solid Waste Cell',
        department_hi: 'GHMC साउथ जोन सॉलिड वेस्ट सेल',
        department_te: 'GHMC సౌత్ జోన్ శానిటేషన్ విభాగం',
        contactPhone: '+91 98499 88776',
      };
    } else if (category === 'tsspdcl_electricity') {
      officer = {
        name: 'Syed Khaja',
        designation: 'Senior Lineman (Electrical)',
        designation_hi: 'वरिष्ठ लाइनमैन (विद्युत)',
        designation_te: 'సీనియర్ లైన్‌మ్యాన్ (విద్యుత్)',
        department: 'TSSPDCL Operation Section',
        department_hi: 'TSSPDCL विद्युत संचालन शाखा',
        department_te: 'TSSPDCL విద్యుత్ నిర్వహణ విభాగం',
        contactPhone: '+91 98499 55667',
      };
    } else if (category === 'roads_srdp') {
      officer = {
        name: 'Er. K. Maheshwar',
        designation: 'Executive Engineer (SRDP/Roads)',
        designation_hi: 'कार्यपालक अभियंता (सड़क निर्माण)',
        designation_te: 'ఎగ్జిక్యూటివ్ ఇంజనీర్ (రోడ్ల విభాగం)',
        department: 'GHMC Engineering Wing',
        department_hi: 'GHMC इंजीनियरिंग विंग',
        department_te: 'GHMC ఇంజనీరింగ్ విభాగం',
        contactPhone: '+91 98499 66778',
      };
    } else if (category === 'drainage_manhole') {
      officer = {
        name: 'Er. Srikanth Reddy',
        designation: 'Manager (Engineering) HMWSSB',
        designation_hi: 'प्रबंधक (इंजीनियरिंग) HMWSSB',
        designation_te: 'మేనేజర్ (ఇంజనీరింగ్) HMWSSB',
        department: 'HMWSSB Drainage & Sewerage Circle',
        department_hi: 'HMWSSB ड्रेनेज व सीवरेज सर्कल',
        department_te: 'HMWSSB డ్రైనేజీ & మురుగునీటి విభాగం',
        contactPhone: '+91 98499 33445',
      };
    }

    const ticketNumber = `GHMC-HYD-${Math.floor(400 + Math.random() * 590)}`;

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber,
      title: title.trim(),
      title_hi: title.trim(),
      title_te: title.trim(),
      category,
      area,
      locationDetails: locationDetails.trim() || 'Ward 72 Lane',
      locationDetails_hi: locationDetails.trim() || 'वार्ड 72 गली',
      locationDetails_te: locationDetails.trim() || 'వార్డు 72 వీధి',
      description: description.trim(),
      description_hi: description.trim(),
      description_te: description.trim(),
      urgency,
      filedBy: filedBy.trim(),
      filedPhone: filedPhone.trim() || undefined,
      createdAt: 'Just now',
      expectedResolution: urgency === 'Tatkāl (Emergency)' ? 'Within 24 Hours' : 'Within 48 Hours',
      expectedResolution_hi: urgency === 'Tatkāl (Emergency)' ? '24 घंटे के भीतर' : '48 घंटे के भीतर',
      expectedResolution_te: urgency === 'Tatkāl (Emergency)' ? '24 గంటల్లోగా' : '48 గంటల్లోగా',
      status: 'submitted',
      assignedOfficer: officer,
      upvotes: 0,
      userUpvoted: false,
      comments: [],
    };

    onSubmit(newComplaint);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {t(language, 'modalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                100% Status Transparency • Direct Assistant Engineer Assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Category & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t(language, 'modalCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getLocalizedText(cat, 'name', language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t(language, 'modalArea')}
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as LocalArea)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {LOCAL_AREAS.filter((a) => a.id !== 'all').map((a) => (
                  <option key={a.id} value={a.id}>
                    {getLocalizedText(a, 'name', language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t(language, 'modalSummary')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(language, 'modalSummaryPh')}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Exact Landmark */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t(language, 'modalLandmark')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder={t(language, 'modalLandmarkPh')}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t(language, 'modalDesc')}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(language, 'modalDescPh')}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Urgency Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              {t(language, 'modalUrgency')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('Tatkāl (Emergency)')}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  urgency === 'Tatkāl (Emergency)'
                    ? 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚡ {t(language, 'urgencyEmergency')}
              </button>

              <button
                type="button"
                onClick={() => setUrgency('Zaroori (Moderate)')}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  urgency === 'Zaroori (Moderate)'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚠️ {t(language, 'urgencyModerate')}
              </button>

              <button
                type="button"
                onClick={() => setUrgency('Routine')}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  urgency === 'Routine'
                    ? 'bg-blue-100 text-blue-900 border-blue-400 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ℹ️ {t(language, 'urgencyRoutine')}
              </button>
            </div>
          </div>

          {/* Citizen Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t(language, 'modalCitizenName')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={filedBy}
                  onChange={(e) => setFiledBy(e.target.value)}
                  placeholder="e.g. Aslam Khan"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t(language, 'modalCitizenPhone')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={filedPhone}
                  onChange={(e) => setFiledPhone(e.target.value)}
                  placeholder="+91 98490 XXXXX"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t(language, 'modalCancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t(language, 'modalSubmit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
