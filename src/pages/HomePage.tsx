import { CmsManagedImage } from '../components/CmsManagedImage';
import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { AmenitiesStrip } from '../components/AmenitiesStrip';
import { SocialProof } from '../components/SocialProof';
import { AvailabilityCalendarModal } from '../components/AvailabilityCalendarModal';
import { Language, BookingSearchQuery, PackageOffer, PromotionalCampaign, PageView } from '../types';
import {useCms, useCmsTranslations} from '../context/CmsContext';
import { getLocalizedRooms, RESORT_ROOMS } from '../data/resortData';
import { Bed, Sparkles, ChevronRight, Gift, Flame, Waves, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface HomePageProps {
  lang: Language;
  onNavigate: (page: PageView) => void;
  onSearch: (query: BookingSearchQuery) => void;
  onOpenBooking: (roomId?: string) => void;
  onSelectPackage: (pkg: PackageOffer) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  onNavigate,
  onSearch,
  onOpenBooking,
  onSelectPackage
}) => {
  const t = useCmsTranslations(lang);
  const { siteSettings } = useCms();
  const [activeCampaigns, setActiveCampaigns] = useState<PromotionalCampaign[]>([]);
  const [isAvailabilityCalendarOpen, setIsAvailabilityCalendarOpen] = useState(false);
  const localizedRooms = getLocalizedRooms(lang, RESORT_ROOMS);

  useEffect(() => {
    let active = true;
    const fetchCampaigns = () => {
      if (!siteSettings.features.promotions) {
        setActiveCampaigns([]);
        return;
      }
      fetch('/api/campaigns')
        .then(res => {
          if (!res.ok) throw new Error(`Campaign request failed (${res.status})`);
          return res.json();
        })
        .then(data => {
          if (active && Array.isArray(data)) setActiveCampaigns(data);
        })
        .catch(err => console.error('Failed to load campaigns:', err));
    };
    fetchCampaigns();
    const intervalId = window.setInterval(fetchCampaigns, 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [siteSettings.features.promotions]);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero Section with Season Switcher, Quick Booking Bar & Promotional Banner right below Sprawdz Dostepnosc buttons */}
      {siteSettings.components.homeHero && <Hero
        lang={lang}
        onSearch={onSearch}
        onOpenBooking={() => onOpenBooking()}
        onOpenAvailabilityModal={() => setIsAvailabilityCalendarOpen(true)}
        activeCampaign={activeCampaigns.length > 0 ? activeCampaigns[0] : null}
        campaignsCount={activeCampaigns.length}
        onNavigateToPackages={() => onNavigate('packages')}
      />}

      {/* Floating Availability Calendar Modal */}
      {siteSettings.components.availabilityCalendar && siteSettings.features.reservations && <AvailabilityCalendarModal
        isOpen={isAvailabilityCalendarOpen}
        onClose={() => setIsAvailabilityCalendarOpen(false)}
        lang={lang}
        onSelectDatesAndBook={({ roomId, checkIn, checkOut, adults }) => {
          onSearch({
            checkIn,
            checkOut,
            adults,
            children: 0,
            roomType: 'all'
          });
          onOpenBooking(roomId);
        }}
      />}

      {/* Quick Amenities Icon Bar */}
      {siteSettings.components.amenitiesStrip && <AmenitiesStrip lang={lang} />}

      {/* About & Mount Pilsko Proximity Preview */}
      {siteSettings.components.homeAbout && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#1E3A2B]" />
              <span>{t.homePage.aboutBadge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E3A2B] leading-tight">
              {t.homePage.aboutTitle}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t.homePage.aboutDescription}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              {siteSettings.pages.about && <button
                onClick={() => onNavigate('about')}
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>{t.homePage.aboutPrimaryCta}</span>
                <ChevronRight className="w-4 h-4" />
              </button>}
              {siteSettings.pages.contact && <button
                onClick={() => onNavigate('contact')}
                className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.homePage.aboutSecondaryCta}
              </button>}
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl overflow-hidden shadow-md h-44">
              <CmsManagedImage src="/images/image-13.jpg" alt="Pilsko zima" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md h-44">
              <CmsManagedImage src="/images/jacuzi.jpg" alt="Jacuzzi w Watrze" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-md h-48">
              <CmsManagedImage src="/images/image-30.jpg" alt="Restauracja Watra" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Featured Rooms Teaser */}
      {siteSettings.components.featuredRooms && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1E3A2B] uppercase tracking-wider mb-1">
              <Bed className="w-3.5 h-3.5" />
              <span>{t.homePage.roomsBadge}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1E3A2B]">
              {t.homePage.roomsTitle}
            </h2>
          </div>
          {siteSettings.pages.rooms && <button
            onClick={() => onNavigate('rooms')}
            className="text-xs font-bold text-[#1E3A2B] hover:text-[#C86D51] flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
          >
            <span>{t.homePage.roomsSecondaryCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localizedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <CmsManagedImage
                    src={room.images[0]}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#1E3A2B] text-[#D4A373] text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    od {room.basePrice} zł / doba
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-serif text-base font-bold text-[#1E3A2B]">
                    {room.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Maks. {room.capacity} os. • {room.bedConfig}
                  </p>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {room.description}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                {siteSettings.features.reservations && <button
                  onClick={() => onOpenBooking(room.id)}
                  className="w-full bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t.homePage.roomsReserveCta}
                </button>}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Wellness & Dining Two-Pillar Showcase */}
      {((siteSettings.components.homeWellness && siteSettings.pages.wellness) ||
        (siteSettings.components.homeRestaurant && siteSettings.pages.restaurant)) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Wellness */}
          {siteSettings.components.homeWellness && siteSettings.pages.wellness && (
          <div
            onClick={() => onNavigate('wellness')}
            className="group relative rounded-3xl overflow-hidden shadow-lg cursor-pointer h-80 flex flex-col justify-end p-6 text-white"
          >
            <CmsManagedImage
              src="/images/jacuzi.jpg"
              alt="Jacuzzi pod gwiazdami"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-[#D4A373] uppercase tracking-wider bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                <Waves className="w-3.5 h-3.5" />
                <span>{t.homePage.wellnessBadge}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold">
                {t.homePage.wellnessTitle}
              </h3>
              <p className="text-xs text-white/80 line-clamp-2">
                {lang === 'pl' ? 'Zanurz się w gorącej wodzie z widokiem na ośnieżone stoki Pilska lub skorzystaj z sauny fińskiej.' : t.hero.subheadline}
              </p>
              <div className="pt-1 text-xs font-bold text-[#D4A373] flex items-center space-x-1">
                <span>{t.homePage.wellnessMore}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
          )}

          {/* Card 2: Restaurant */}
          {siteSettings.components.homeRestaurant && siteSettings.pages.restaurant && (
          <div
            onClick={() => onNavigate('restaurant')}
            className="group relative rounded-3xl overflow-hidden shadow-lg cursor-pointer h-80 flex flex-col justify-end p-6 text-white"
          >
            <CmsManagedImage
              src="/images/image-30.jpg"
              alt="Restauracja Watra"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-[#D4A373] uppercase tracking-wider bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                <Flame className="w-3.5 h-3.5" />
                <span>{t.homePage.restaurantBadge}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold">
                {t.homePage.restaurantTitle}
              </h3>
              <p className="text-xs text-white/80 line-clamp-2">
                {lang === 'pl' ? 'Tradycyjna kwaśnica na żeberku, placki po zbójnicku, pstrąg z potoku i regionalne biesiady przy ogniu.' : t.hero.subheadline}
              </p>
              <div className="pt-1 text-xs font-bold text-[#D4A373] flex items-center space-x-1">
                <span>{t.homePage.restaurantMore}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
          )}
        </div>
      </section>
      )}

      {/* Social Proof & Verified Reviews */}
      {siteSettings.components.socialProof && <SocialProof lang={lang} />}
    </div>
  );
};
