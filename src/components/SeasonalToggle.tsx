import { CmsManagedImage } from './CmsManagedImage';
import { useCmsTranslations } from '../context/CmsContext';
import React, { useState } from 'react';
import { Snowflake, Sun, CheckCircle2, MapPin, Compass, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface SeasonalToggleProps {
  lang: Language;
}

export const SeasonalToggle: React.FC<SeasonalToggleProps> = ({ lang }) => {
  const [season, setSeason] = useState<'winter' | 'summer'>('winter');
  const t = useCmsTranslations(lang);

  return (
    <section id="sezony" className="py-20 bg-[#14281E] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2A4F3B]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4A373] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3">
            <Compass className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{t.seasons.tag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F9F8F6]">
            {t.seasons.title}
          </h2>

          {/* Interactive Toggle Pills */}
          <div className="inline-flex p-1.5 bg-[#1E3A2B] rounded-2xl border border-[#2A4F3B] mt-6 shadow-inner">
            <button
              onClick={() => setSeason('winter')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                season === 'winter'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Snowflake className="w-4 h-4 text-blue-200" />
              <span>{t.seasons.winterTab}</span>
            </button>
            <button
              onClick={() => setSeason('summer')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                season === 'summer'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-200" />
              <span>{t.seasons.summerTab}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Seasonal Showcase */}
        {season === 'winter' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-in fade-in duration-300">
            {/* Left points */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Snowflake className="w-3.5 h-3.5" />
                <span>{t.seasonalExtra?.winterSeasonTag || 'Sezon zimowy w Korbielowie (Grudzień – Kwiecień)'}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
                {t.seasons.winterTitle}
              </h3>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-light">
                {t.seasons.winterDesc}
              </p>

              <div className="space-y-3 pt-2">
                {t.seasons.winterPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right imagery composite */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-64">
                  <CmsManagedImage
                    src="/images/banner-1.jpg"
                    alt="Panoramiczne widoki Korbielów"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-44">
                  <CmsManagedImage
                    src="/images/image-71.jpg"
                    alt="Wyciągi narciarskie Pilsko"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-44">
                  <CmsManagedImage
                    src="/images/image-72.jpg"
                    alt="Trasa narciarska Korbielów"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="bg-[#1E3A2B] p-5 rounded-2xl border border-blue-500/30 flex flex-col justify-between h-64">
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-300">
                      {t.seasonalExtra?.snowGuarantee || 'Gwarancja Śniegu'}
                    </span>
                    <h4 className="font-serif text-xl font-bold mt-1 text-white">
                      {t.seasonalExtra?.pilskoMicroclimate || 'Mikroklimat Pilska'}
                    </h4>
                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {t.seasonalExtra?.pilskoMicroclimateDesc || 'Dzięki wysokości 1557 m n.p.m. i specyficznemu mikroklimatowi, śnieg na Pilsku utrzymuje się często aż do maja.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#D4A373] font-bold">
                    <span>{t.seasonalExtra?.slopeDistance || '100 m od drzwi do wyciągu'}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-in fade-in duration-300">
            {/* Left points */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sun className="w-3.5 h-3.5" />
                <span>{t.seasonalExtra?.summerSeasonTag || 'Sezon letni w Beskidach (Maj – Październik)'}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
                {t.seasons.summerTitle}
              </h3>

              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-light">
                {t.seasons.summerDesc}
              </p>

              <div className="space-y-3 pt-2">
                {t.seasons.summerPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right imagery composite */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-64">
                  <CmsManagedImage
                    src="/images/banner-1.jpg"
                    alt="Letnie szlaki górskie"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-44">
                  <CmsManagedImage
                    src="/images/jacuzi.jpg"
                    alt="Letnie jacuzzi w ogrodzie"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 h-44">
                  <CmsManagedImage
                    src="/images/image-69.jpg"
                    alt="Okolice Korbielowa latem"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="bg-[#1E3A2B] p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between h-64">
                  <div>
                    <span className="text-xs font-bold uppercase text-amber-300">
                      {t.seasonalExtra?.mountainTrails || 'Górskie Szlaki'}
                    </span>
                    <h4 className="font-serif text-xl font-bold mt-1 text-white">
                      {t.seasonalExtra?.trekkingEnduro || 'Trekking & Enduro'}
                    </h4>
                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {t.seasonalExtra?.trekkingEnduroDesc || 'Szlaki w stronę Hali Miziowej, Rysianki i Babiej Góry zaczynają się bezpośrednio przy ośrodku. Wspaniałe panoramy Tatr i Beskidów.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#D4A373] font-bold">
                    <span>{t.seasonalExtra?.gardenGrill || 'Ogród wypoczynkowy & Wiata grillowa'}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
