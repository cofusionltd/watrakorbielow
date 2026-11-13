import { CmsManagedImage } from '../components/CmsManagedImage';
import React, { useState } from 'react';
import { Language } from '../types';
import { Snowflake, Sun, Mountain, Compass, Check, Calendar, ArrowRight, Shield } from 'lucide-react';
import {useCms, useCmsTranslations} from '../context/CmsContext';

interface SeasonsPageProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const SeasonsPage: React.FC<SeasonsPageProps> = ({ lang, onOpenBooking }) => {
  const { siteSettings } = useCms();
  const t = useCmsTranslations(lang);
  const [activeSeason, setActiveSeason] = useState<'winter' | 'summer'>('winter');

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header and Switcher */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
            <Mountain className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.seasonsPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {t.seasonsPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {t.seasonsPage.subtitle}
          </p>

          {/* Large Season Switcher Toggle */}
          {siteSettings.components.seasonalToggle && <div className="inline-flex p-1.5 bg-white rounded-2xl border border-neutral-300 shadow-md">
            <button
              onClick={() => setActiveSeason('winter')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSeason === 'winter'
                  ? 'bg-[#1E3A2B] text-[#D4A373] shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Snowflake className="w-4 h-4 text-cyan-400" />
              <span>{t.seasonsPage.winterTabBtn}</span>
            </button>
            <button
              onClick={() => setActiveSeason('summer')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeSeason === 'summer'
                  ? 'bg-[#1E3A2B] text-[#D4A373] shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{t.seasonsPage.summerTabBtn}</span>
            </button>
          </div>}
        </div>

        {/* WINTER TAB CONTENT */}
        {activeSeason === 'winter' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full uppercase">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-700" />
                  <span>{t.seasonsPage.winterBadge}</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1E3A2B]">
                  {t.seasonsPage.winterHeading}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t.seasonsPage.winterLead}
                </p>
                <div className="space-y-2.5 text-xs text-neutral-700">
                  {(t.seasonsPage.winterPoints || []).map((point, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  {siteSettings.features.reservations && <button
                    onClick={onOpenBooking}
                    className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                  >
                    {t.seasonsPage.bookWinterBtn}
                  </button>}
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-md h-64">
                  <CmsManagedImage src="/images/image-13.jpg" alt="Pilsko narty" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-36">
                  <CmsManagedImage src="/images/image-12.jpg" alt="Stok narciarski" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-36">
                  <CmsManagedImage src="/images/image-15.jpg" alt="Zimowe stoki" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Slopes Specs Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
                <div className="font-serif text-3xl font-bold text-[#1E3A2B]">{t.seasonsPage.slopeSpec1Val}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{t.seasonsPage.slopeSpec1Label}</div>
                <p className="text-xs text-neutral-600">{t.seasonsPage.slopeSpec1Desc}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
                <div className="font-serif text-3xl font-bold text-[#1E3A2B]">{t.seasonsPage.slopeSpec2Val}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{t.seasonsPage.slopeSpec2Label}</div>
                <p className="text-xs text-neutral-600">{t.seasonsPage.slopeSpec2Desc}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
                <div className="font-serif text-3xl font-bold text-[#1E3A2B]">{t.seasonsPage.slopeSpec3Val}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{t.seasonsPage.slopeSpec3Label}</div>
                <p className="text-xs text-neutral-600">{t.seasonsPage.slopeSpec3Desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* SUMMER TAB CONTENT */}
        {activeSeason === 'summer' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase">
                  <Sun className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.seasonsPage.summerBadge}</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1E3A2B]">
                  {t.seasonsPage.summerHeading}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t.seasonsPage.summerLead}
                </p>
                <div className="space-y-2.5 text-xs text-neutral-700">
                  {(t.seasonsPage.summerPoints || []).map((point, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  {siteSettings.features.reservations && <button
                    onClick={onOpenBooking}
                    className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                  >
                    {t.seasonsPage.bookSummerBtn}
                  </button>}
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-md h-64">
                  <CmsManagedImage src="/images/image-08.jpg" alt="Letnie szlaki" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-36">
                  <CmsManagedImage src="/images/image-09.jpg" alt="Hala Miziowa widok" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-36">
                  <CmsManagedImage src="/images/image-10.jpg" alt="Górski krajobraz" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
