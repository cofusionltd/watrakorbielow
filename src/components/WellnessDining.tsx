import { CmsManagedImage } from './CmsManagedImage';
import { useCmsTranslations } from '../context/CmsContext';
import React from 'react';
import { Waves, UtensilsCrossed, Flame, Sparkles, HeartPulse, Check, Calendar } from 'lucide-react';
import { Language } from '../types';

interface WellnessDiningProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const WellnessDining: React.FC<WellnessDiningProps> = ({ lang, onOpenBooking }) => {
  const t = useCmsTranslations(lang);

  return (
    <section id="wellness" className="py-20 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Block 1: Outdoor Jacuzzi & Wellness */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              <Waves className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.wellnessDiningExtra?.wellnessTag || 'Strefa Relaksu & Zdrowia'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B] leading-tight">
              {t.wellnessDining.wellnessTitle}
            </h2>

            <p className="text-base text-neutral-700 leading-relaxed">
              {t.wellnessDining.wellnessText}
            </p>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-[#1E3A2B]">
                <Flame className="w-4 h-4 text-[#C86D51]" />
                <span>{t.wellnessDiningExtra?.recreationTitle || 'Odnowa & Rekreacja w Resorcie'}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {t.wellnessDiningExtra?.recreationDesc || t.wellnessDining.rehabText}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-neutral-700 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.wellnessDiningExtra?.saunaItem || 'Tradycyjna sucha sauna fińska'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.wellnessDiningExtra?.jacuzziItem || 'Zewnętrzne jacuzzi z ciepłą wodą'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.wellnessDiningExtra?.billiardItem || 'Stół bilardowy i sala klubowa'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.wellnessDiningExtra?.pingPongItem || 'Tenis stołowy (ping-pong)'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-xl border-4 border-white h-72">
              <CmsManagedImage
                src="/images/jacuzi.jpg"
                alt="Zewnętrzne jacuzzi Watra Korbielów"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md h-40 border-2 border-white">
              <CmsManagedImage
                src="/images/image-63.jpg"
                alt="Tradycyjna sucha sauna fińska"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md h-40 border-2 border-white">
              <CmsManagedImage
                src="/images/bilard-1.jpg"
                alt="Sala bilardowa w Watra Korbielów"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Block 2: Regional Restaurant & Karczma Grillowa */}
        <div id="restauracja" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Images on the left */}
          <div className="lg:col-span-6 order-2 lg:order-1 grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden shadow-md h-48 border-2 border-white">
              <CmsManagedImage
                src="/images/image-30.jpg"
                alt="Wnętrze restauracji Watra"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md h-48 border-2 border-white">
              <CmsManagedImage
                src="/images/image-31.jpg"
                alt="Regionalne dania i bar"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-xl border-4 border-white h-64">
              <CmsManagedImage
                src="/images/image-32.jpg"
                alt="Wiata grillowa i biesiadna"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Text on the right */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.wellnessDiningExtra?.diningTag || 'Smaki Beskidzkiej Kuchni'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B] leading-tight">
              {t.wellnessDining.diningTitle}
            </h2>

            <p className="text-base text-neutral-700 leading-relaxed">
              {t.wellnessDining.diningText}
            </p>

            {/* Special Features */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4A373]/30 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-[#1E3A2B]">
                <Flame className="w-4 h-4 text-[#D4A373]" />
                <span>{t.wellnessDiningExtra?.grillBanquetsTitle || 'Wiata Grillowa & Przyjęcia Okolicznościowe'}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {t.wellnessDining.eventNotice}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="bg-[#F9F8F6] text-[#1E3A2B] font-semibold px-3 py-1 rounded-md border border-neutral-200">
                  {t.wellnessDiningExtra?.kwasnica || '🍲 Kwaśnica na żeberku'}
                </span>
                <span className="bg-[#F9F8F6] text-[#1E3A2B] font-semibold px-3 py-1 rounded-md border border-neutral-200">
                  {t.wellnessDiningExtra?.placki || '🥞 Placki po zbójnicku'}
                </span>
                <span className="bg-[#F9F8F6] text-[#1E3A2B] font-semibold px-3 py-1 rounded-md border border-neutral-200">
                  {t.wellnessDiningExtra?.oscypek || '🧀 Oscypek z żurawiną'}
                </span>
                <span className="bg-[#F9F8F6] text-[#1E3A2B] font-semibold px-3 py-1 rounded-md border border-neutral-200">
                  {t.wellnessDiningExtra?.pstrag || '🐟 Pstrąg z potoku'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center space-x-2 bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.wellnessDiningExtra?.bookDiningBtn || 'Zarezerwuj pobyt z wyżywieniem'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
