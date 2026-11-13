import { CmsManagedImage } from './CmsManagedImage';
import { useCmsTranslations } from '../context/CmsContext';
import React, { useState } from 'react';
import { Bed, Users, Maximize2, Coffee, Check, ChevronRight, Eye, Sparkles, Star } from 'lucide-react';
import { Language, Room } from '../types';
import { useRooms } from '../hooks/useRooms';

interface RoomsSectionProps {
  lang: Language;
  onSelectRoom: (roomId: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ lang, onSelectRoom }) => {
  const { rooms } = useRooms(lang);
  const [activeCategory, setActiveCategory] = useState<'all' | 'double' | 'family' | 'suite'>('all');
  const [galleryModalRoom, setGalleryModalRoom] = useState<Room | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const t = useCmsTranslations(lang);

  const filteredRooms = activeCategory === 'all' 
    ? rooms 
    : rooms.filter(r => r.category === activeCategory);

  return (
    <section id="pokoje" className="py-20 bg-white text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full mb-3">
              <Bed className="w-3.5 h-3.5 text-[#1E3A2B]" />
              <span>{t.rooms.tag}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B]">
              {t.rooms.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              {t.rooms.subtitle}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1.5 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.rooms.filterAll}
            </button>
            <button
              onClick={() => setActiveCategory('double')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'double'
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.rooms.filterDouble}
            </button>
            <button
              onClick={() => setActiveCategory('family')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'family'
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.rooms.filterFamily}
            </button>
            <button
              onClick={() => setActiveCategory('suite')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'suite'
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t.rooms.filterSuites}
            </button>
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              id={`room-card-${room.id}`}
              className="bg-[#F9F8F6] rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Container with Hover Gallery Trigger */}
              <div className="relative h-56 overflow-hidden">
                <CmsManagedImage
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{t.common.photosCount ? t.common.photosCount(room.images.length) : `${room.images.length} zdjęcia`}</span>
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-3 left-3 bg-[#1E3A2B] text-white px-3 py-1.5 rounded-lg shadow-md">
                  <span className="text-[10px] uppercase text-[#D4A373] mr-1">{t.rooms.fromPrice}</span>
                  <span className="font-serif text-lg font-bold text-white">{room.basePrice} zł</span>
                  <span className="text-[10px] text-white/80 ml-1">{t.common.perNight}</span>
                </div>

                {/* Quick preview gallery hover button */}
                <button
                  type="button"
                  onClick={() => {
                    setGalleryModalRoom(room);
                    setSelectedPhotoIndex(0);
                  }}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.common.seeGallery}</span>
                </button>
              </div>

              {/* Room Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1E3A2B] leading-tight mb-2">
                    {room.name}
                  </h3>

                  {/* Room Meta Specs */}
                  <div className="flex items-center space-x-4 text-xs text-neutral-600 mb-3 pb-3 border-b border-neutral-200">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{t.common.upToPersons ? t.common.upToPersons(room.capacity) : `Do ${room.capacity} osób`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{room.size}</span>
                    </div>
                  </div>

                  {/* Bed Configuration */}
                  <div className="text-xs text-neutral-600 mb-3 flex items-start space-x-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#1E3A2B] shrink-0 mt-0.5" />
                    <span>{room.bedConfig}</span>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[10px] font-semibold bg-white text-[#1E3A2B] px-2 py-0.5 rounded border border-neutral-200"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-600 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className="w-full bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>{t.rooms.bookDirect}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free perks guarantee banner */}
        <div className="mt-12 bg-[#1E3A2B] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#2A4F3B]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4A373] text-[#14281E] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#F9F8F6]">
                {t.common.whyBookDirectTitle}
              </h4>
              <p className="text-xs sm:text-sm text-[#F9F8F6]/80 mt-0.5">
                {t.common.whyBookDirectDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectRoom('all')}
            className="shrink-0 bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] font-bold text-xs uppercase px-6 py-3 rounded-xl transition-colors cursor-pointer"
          >
            {t.common.checkDates}
          </button>
        </div>
      </div>

      {/* Lightbox / Gallery Modal */}
      {galleryModalRoom && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setGalleryModalRoom(null)}
        >
          <div 
            className="bg-[#14281E] border border-white/20 rounded-2xl max-w-3xl w-full p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
              <h3 className="font-serif text-xl font-bold">{galleryModalRoom.name}</h3>
              <button
                onClick={() => setGalleryModalRoom(null)}
                className="text-white/60 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 h-72 sm:h-96 rounded-xl overflow-hidden bg-black/50">
              <CmsManagedImage
                src={galleryModalRoom.images[selectedPhotoIndex]}
                alt="Room detail"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Row */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {galleryModalRoom.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    selectedPhotoIndex === i ? 'border-[#D4A373] scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <CmsManagedImage src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-[#D4A373]">
                {galleryModalRoom.size} • {galleryModalRoom.bedConfig}
              </span>
              <button
                onClick={() => {
                  const rId = galleryModalRoom.id;
                  setGalleryModalRoom(null);
                  onSelectRoom(rId);
                }}
                className="bg-[#D4A373] text-[#14281E] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#c89260]"
              >
                {t.common.selectThisRoom}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
