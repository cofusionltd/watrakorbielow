import React, { useState } from 'react';
import { Language, Room } from '../types';
import { translations } from '../translations';
import { useRooms } from '../hooks/useRooms';
import { Bed, Users, Maximize, Check, Calendar, Sparkles, ShieldCheck, Eye, X } from 'lucide-react';

interface RoomsPageProps {
  lang: Language;
  onSelectRoom: (roomId: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ lang, onSelectRoom }) => {
  const { rooms } = useRooms();
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'double' | 'family' | 'suite'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredRooms = selectedCategory === 'all'
    ? rooms
    : rooms.filter(r => r.category === selectedCategory);

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
            <Bed className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.roomsPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {t.roomsPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {t.roomsPage.subtitle}
          </p>

          {/* Direct booking advantage banner */}
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{t.roomsPage.priceGuarantee}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1E3A2B] text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.roomsPage.allCategories(rooms.length)}
            </button>
            <button
              onClick={() => setSelectedCategory('double')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'double'
                  ? 'bg-[#1E3A2B] text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.roomsPage.doubleRooms}
            </button>
            <button
              onClick={() => setSelectedCategory('family')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'family'
                  ? 'bg-[#1E3A2B] text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.roomsPage.familyStudios}
            </button>
            <button
              onClick={() => setSelectedCategory('suite')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'suite'
                  ? 'bg-[#1E3A2B] text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.roomsPage.apartments}
            </button>
          </div>
        </div>

        {/* Rooms Detailed List */}
        <div className="space-y-8">
          {filteredRooms.map((room) => {
            const directPrice = Math.round(room.basePrice * 0.9);
            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center"
              >
                {/* Images Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div
                    onClick={() => setLightboxImage(room.images[0])}
                    className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{t.roomsPage.zoomPhoto}</span>
                    </div>
                  </div>

                  {/* Thumbnail gallery */}
                  <div className="grid grid-cols-3 gap-2">
                    {room.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="h-16 rounded-xl overflow-hidden cursor-pointer border border-neutral-200"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#1E3A2B] text-[#D4A373] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                        {room.category === 'double' ? t.roomsPage.doubleCategory : room.category === 'family' ? t.roomsPage.familyCategory : t.roomsPage.suiteCategory}
                      </span>
                      <span className="text-xs text-neutral-500 flex items-center space-x-1">
                        <Maximize className="w-3.5 h-3.5" />
                        <span>{room.size}</span>
                      </span>
                    </div>

                    {/* Capacity Badge */}
                    <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-[#1E3A2B]" />
                      <span>{t.roomsPage.maxGuests(room.capacity)}</span>
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                    {room.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="bg-[#F9F8F6] p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700">
                    <strong>{t.roomsPage.bedLayout}</strong> {room.bedConfig}
                  </div>

                  {/* Amenity tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {room.tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 text-[11px] bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-md text-neutral-700"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing and Action Box */}
                  <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] text-neutral-400 line-through">
                        {t.roomsPage.bookingPrice(room.basePrice)}
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-serif text-2xl font-bold text-[#1E3A2B]">
                          {directPrice} zł
                        </span>
                        <span className="text-xs text-neutral-500">{t.roomsPage.perNightWithBreakfast}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {t.roomsPage.saveDirect(room.basePrice - directPrice)}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t.roomsPage.bookThisRoom}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
              <img src={lightboxImage} alt="" className="w-full h-full object-contain" />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
