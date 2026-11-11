import React from 'react';
import { Gift, Check, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Language, PackageOffer } from '../types';
import { translations } from '../translations';
import { PACKAGE_OFFERS } from '../data/resortData';

interface PackagesSectionProps {
  lang: Language;
  onSelectPackage: (pkg: PackageOffer) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ lang, onSelectPackage }) => {
  const t = translations[lang];

  return (
    <section id="pakiety" className="py-20 bg-white text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full mb-3">
            <Gift className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.packages.tag}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B]">
            {t.packages.title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            {t.packages.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGE_OFFERS.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-[#F9F8F6] rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {pkg.badge && (
                    <div className="absolute top-3 left-3 bg-[#1E3A2B] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                      {pkg.badge}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#D4A373]" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-[#1E3A2B] leading-snug mb-1">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    {pkg.subtitle}
                  </p>

                  <div className="space-y-2 mb-4">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-neutral-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-200/60 mt-2">
                <div className="pt-3 pb-3 flex items-baseline justify-between">
                  <span className="text-xs text-neutral-500">{t.packagesPage?.priceFrom || 'Cena pakietu od'}:</span>
                  <span className="font-serif text-lg font-bold text-[#1E3A2B]">
                    {pkg.price}
                  </span>
                </div>
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] font-bold text-xs uppercase py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
                >
                  <span>{t.packages.bookPackage}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
