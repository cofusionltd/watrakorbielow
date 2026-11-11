import React from 'react';
import { MapPin, Mountain, Compass, Award, ExternalLink, Navigation } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { RESORT_STATS } from '../data/resortData';

interface AboutLocationProps {
  lang: Language;
}

export const AboutLocation: React.FC<AboutLocationProps> = ({ lang }) => {
  const t = translations[lang];

  const distances = [
    { distance: "100 m", title: t.about.prox1, tag: "Stok & Wyciąg" },
    { distance: "800 m", title: t.about.prox2, tag: "Pilsko Jontek" },
    { distance: "2 km", title: t.about.prox3, tag: "Słowacja" },
    { distance: "0 m", title: t.about.prox4, tag: "Szlak Pieszy" },
  ];

  return (
    <section id="o-nas" className="py-20 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full mb-3">
            <Mountain className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.about.tag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B] leading-tight">
            {t.about.title}
          </h2>
        </div>

        {/* Grid: Story + Gallery + Distance Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
              {t.about.description1}
            </p>
            <p className="text-base text-neutral-600 leading-relaxed">
              {t.about.description2}
            </p>

            {/* Metric stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 pb-2">
              {RESORT_STATS.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
                  <div className="font-serif text-2xl font-bold text-[#1E3A2B]">{stat.value}</div>
                  <div className="text-xs font-semibold text-neutral-800 mt-1">{stat.label}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Proximity Checklist */}
            <div className="bg-white rounded-2xl p-6 border border-[#D4A373]/30 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E3A2B] flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-[#D4A373]" />
                <span>{t.about.proximityTitle}</span>
              </h3>
              <div className="space-y-2.5">
                {distances.map((d, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm text-neutral-700">
                    <span className="font-bold text-xs bg-[#1E3A2B] text-white px-2 py-0.5 rounded shrink-0 mt-0.5">
                      {d.distance}
                    </span>
                    <span className="leading-snug">{d.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composite & Interactive Map Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="/images/image-70.jpg"
                alt="Watra Korbielów widok z zewnątrz"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
                    Korbielów • Beskid Żywiecki
                  </span>
                  <h4 className="font-serif text-xl font-bold">Ośrodek Watra Korbielów</h4>
                  <p className="text-xs text-white/80">{t.common.picturesqueDesc}</p>
                </div>
              </div>
            </div>

            {/* Secondary Photo and Map preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden shadow-md h-36 border-2 border-white">
                <img
                  src="/images/about.jpg"
                  alt="Masyw Pilska i szlaki"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Interactive Directions Card */}
              <div className="bg-[#1E3A2B] text-white p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-[#D4A373] text-xs font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.common.navigateUs}</span>
                  </div>
                  <p className="text-xs text-[#F9F8F6]/80 leading-tight">
                    ul. Graniczna 17<br />
                    34-335 Korbielów
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Watra+Korbielów+Graniczna+17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#D4A373] hover:text-amber-200 mt-2"
                >
                  <span>{t.common.openInGoogleMaps}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
