import { CmsManagedImage } from '../components/CmsManagedImage';
import React from 'react';
import { Language } from '../types';
import { Waves, Sparkles, Flame, HeartPulse, Check, Clock, ShieldCheck, Calendar } from 'lucide-react';
import {useCms, useCmsTranslations} from '../context/CmsContext';

interface WellnessPageProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const WellnessPage: React.FC<WellnessPageProps> = ({ lang, onOpenBooking }) => {
  const t = useCmsTranslations(lang);
  const { content, siteSettings } = useCms();
  const wellCms = content.wellness;

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            <Waves className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.wellnessPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {t.wellnessPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {lang === 'pl' ? (wellCms.pricingNote || t.wellnessPage.lead) : t.wellnessPage.lead}
          </p>
        </div>

        {/* Feature 1: Outdoor Jacuzzi Under Stars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>{t.wellnessPage.jacuzziBadge}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
              {lang === 'pl' ? (wellCms.jacuzziTitle || t.wellnessPage.jacuzziHeading) : t.wellnessPage.jacuzziHeading}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {lang === 'pl' ? (wellCms.jacuzziDescription || (wellCms as any).jacuzziDesc || t.wellnessPage.jacuzziLead) : t.wellnessPage.jacuzziLead}
            </p>
            <div className="space-y-2 text-xs text-neutral-700">
              {(t.wellnessPage.jacuzziPoints || []).map((point, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              {siteSettings.features.reservations && <button
                onClick={onOpenBooking}
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer"
              >
                {t.wellnessPage.bookJacuzziBtn}
              </button>}
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-xl border-4 border-white h-80 sm:h-96">
            <CmsManagedImage
              src="/images/jacuzi.jpg"
              alt="Jacuzzi w Watra Korbielów"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Feature 2: Finnish Dry Sauna */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="lg:col-span-5 order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <CmsManagedImage
              src="/images/wellness-activities.png"
              alt="Grota solna, sauna, sala fitness, balie i kącik wypoczynkowy"
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-800 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>{t.wellnessPage.saunaBadge}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
              {lang === 'pl' ? (wellCms.saunaTitle || t.wellnessPage.saunaHeading) : t.wellnessPage.saunaHeading}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {lang === 'pl' ? (wellCms.saunaDescription || (wellCms as any).saunaDesc || t.wellnessPage.saunaLead) : t.wellnessPage.saunaLead}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.wellnessPage.activities.map((activity) => (
                <div key={activity.title} className="rounded-xl border border-neutral-200 bg-[#F9F8F6] p-3">
                  <h3 className="text-xs font-bold text-[#1E3A2B]">{activity.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Practical Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <Clock className="w-5 h-5 text-[#D4A373]" />
            <h3 className="font-serif text-base font-bold text-[#1E3A2B]">{t.wellnessPage.hoursTitle}</h3>
            <p className="text-xs text-neutral-600">{t.wellnessPage.hoursDesc}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <HeartPulse className="w-5 h-5 text-[#D4A373]" />
            <h3 className="font-serif text-base font-bold text-[#1E3A2B]">{t.wellnessPage.safetyTitle}</h3>
            <p className="text-xs text-neutral-600">{t.wellnessPage.safetyDesc}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
            <Sparkles className="w-5 h-5 text-[#D4A373]" />
            <h3 className="font-serif text-base font-bold text-[#1E3A2B]">{t.wellnessPage.vipTitle}</h3>
            <p className="text-xs text-neutral-600">{t.wellnessPage.vipDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
