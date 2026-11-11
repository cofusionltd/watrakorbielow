import React from 'react';
import { Wifi, Utensils, Waves, MountainSnow, Flame, Activity, ShieldCheck, Car } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AmenitiesStripProps {
  lang: Language;
}

export const AmenitiesStrip: React.FC<AmenitiesStripProps> = ({ lang }) => {
  const t = translations[lang];

  const amenities = [
    {
      id: "amenity-ski",
      icon: MountainSnow,
      title: t.amenities.skiTitle,
      desc: t.amenities.skiDesc,
      highlight: true
    },
    {
      id: "amenity-spa",
      icon: Waves,
      title: t.amenities.spaTitle,
      desc: t.amenities.spaDesc,
      highlight: true
    },
    {
      id: "amenity-dining",
      icon: Utensils,
      title: t.amenities.restaurantTitle,
      desc: t.amenities.restaurantDesc,
      highlight: false
    },
    {
      id: "amenity-grill",
      icon: Flame,
      title: t.amenities.grillTitle,
      desc: t.amenities.grillDesc,
      highlight: false
    },
    {
      id: "amenity-rehab",
      icon: Activity,
      title: t.amenities.rehabTitle,
      desc: t.amenities.rehabDesc,
      highlight: false
    },
    {
      id: "amenity-wifi",
      icon: Wifi,
      title: t.amenities.wifiTitle,
      desc: t.amenities.wifiDesc,
      highlight: false
    },
    {
      id: "amenity-parking",
      icon: Car,
      title: t.amenities.parkingTitle,
      desc: t.amenities.parkingDesc,
      highlight: false
    }
  ];

  return (
    <section id="amenities-strip" className="bg-[#1E3A2B] text-white py-12 border-y border-[#2A4F3B]/50 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
            {t.amenities.heading}
          </h2>
          <p className="text-sm text-[#D4A373] mt-1 font-medium">
            {t.amenities.subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {amenities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className={`p-4 rounded-xl transition-all duration-300 flex flex-col items-center text-center ${
                  item.highlight
                    ? 'bg-[#2A4F3B]/70 border border-[#D4A373]/40 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  item.highlight
                    ? 'bg-[#D4A373] text-[#14281E]'
                    : 'bg-[#14281E] text-[#D4A373] border border-[#2A4F3B]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#F9F8F6] mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#F9F8F6]/70 leading-snug">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
