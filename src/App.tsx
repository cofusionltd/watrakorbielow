/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AiChatConcierge } from './components/AiChatConcierge';
import { AnalyticsTracker } from './components/AnalyticsTracker';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { RoomsPage } from './pages/RoomsPage';
import { SeasonsPage } from './pages/SeasonsPage';
import { WellnessPage } from './pages/WellnessPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { PackagesPage } from './pages/PackagesPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

import { Language, BookingSearchQuery, PackageOffer, PageView } from './types';
import { Phone, Calendar } from 'lucide-react';
import { CmsProvider, useCms, useCmsTranslations } from './context/CmsContext';
import { motion } from 'motion/react';

const PAGE_HASH_MAP: Record<string, PageView> = {
  '': 'home',
  '#/': 'home',
  '#/home': 'home',
  '#/o-nas': 'about',
  '#/pokoje': 'rooms',
  '#/zima-lato': 'seasons',
  '#/wellness': 'wellness',
  '#/restauracja': 'restaurant',
  '#/rehabilitacja': 'wellness',
  '#/pakiety': 'packages',
  '#/kontakt': 'contact',
  '#/admin': 'admin',
};

const HASH_FOR_PAGE: Record<PageView, string> = {
  home: '#/home',
  about: '#/o-nas',
  rooms: '#/pokoje',
  seasons: '#/zima-lato',
  wellness: '#/wellness',
  restaurant: '#/restauracja',
  packages: '#/pakiety',
  contact: '#/kontakt',
  admin: '#/admin',
};

const AppContent: React.FC = () => {
  const { siteSettings } = useCms();
  const [lang, setLang] = useState<Language>('pl');
  const t = useCmsTranslations(lang);
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingQuery, setBookingQuery] = useState<BookingSearchQuery | undefined>(undefined);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState<PackageOffer | null>(null);

  useEffect(() => {
    if (!siteSettings.features.reservations) {
      setIsBookingModalOpen(false);
    }
  }, [siteSettings.features.reservations]);

  // Initialize and listen to hash routing
  useEffect(() => {
    const enabledPages = (Object.keys(siteSettings.pages) as Array<Exclude<PageView, 'admin'>>)
      .filter((page) => siteSettings.pages[page]);
    const fallbackPage = enabledPages.includes('home') ? 'home' : enabledPages[0];
    const handleHashChange = () => {
      const hash = window.location.hash;
      const page = PAGE_HASH_MAP[hash];
      if (page === 'admin') {
        setCurrentPage('admin');
      } else if (page && siteSettings.pages[page]) {
        setCurrentPage(page);
      } else if (fallbackPage) {
        setCurrentPage(fallbackPage);
        window.location.hash = HASH_FOR_PAGE[fallbackPage];
      } else if (hash && hash !== '#') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [siteSettings.pages]);

  const navigateTo = (page: PageView) => {
    const enabledPages = (Object.keys(siteSettings.pages) as Array<Exclude<PageView, 'admin'>>)
      .filter((publicPage) => siteSettings.pages[publicPage]);
    const targetPage: PageView = page === 'admin'
      ? 'admin'
      : siteSettings.pages[page]
        ? page
        : enabledPages.includes('home') ? 'home' : enabledPages[0] || 'home';
    setCurrentPage(targetPage);
    window.location.hash = HASH_FOR_PAGE[targetPage];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (roomId?: string) => {
    if (!siteSettings.features.reservations) return;
    setSelectedPackage(null);
    setPreselectedRoomId(roomId);
    setIsBookingModalOpen(true);
  };

  const handleSearchFromBar = (query: BookingSearchQuery) => {
    if (!siteSettings.features.reservations) return;
    setBookingQuery(query);
    setPreselectedRoomId(query.roomType === 'all' ? undefined : query.roomType);
    setSelectedPackage(null);
    setIsBookingModalOpen(true);
  };

  const handleSelectPackage = (pkg: PackageOffer) => {
    if (!siteSettings.features.reservations) return;
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  return (
      <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#222222] font-sans antialiased selection:bg-[#D4A373]/30 selection:text-[#1E3A2B]">
      {/* Sticky Header with Multi-Page Navigation & Language Switcher */}
      {siteSettings.components.header && <Header
        lang={lang}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLanguageChange={setLang}
        onOpenBooking={() => handleOpenBooking()}
      />}

      {/* Real-time Visitor Telemetry Tracker */}
      <AnalyticsTracker currentPage={currentPage} />

      {/* Main Multi-Page Routed View */}
      <main className="flex-grow">
        {currentPage !== 'admin' && !Object.values(siteSettings.pages).some(Boolean) && (
          <div className="mx-auto max-w-3xl px-6 py-24 text-center text-neutral-700">
            <h1 className="font-serif text-2xl font-bold">Strona jest obecnie niedostępna</h1>
          </div>
        )}
        {currentPage === 'home' && siteSettings.pages.home && (
          <HomePage
            lang={lang}
            onNavigate={navigateTo}
            onSearch={handleSearchFromBar}
            onOpenBooking={handleOpenBooking}
            onSelectPackage={handleSelectPackage}
          />
        )}

        {currentPage === 'about' && siteSettings.pages.about && (
          <AboutPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'rooms' && siteSettings.pages.rooms && (
          <RoomsPage
            lang={lang}
            onSelectRoom={(roomId) => handleOpenBooking(roomId)}
          />
        )}

        {currentPage === 'seasons' && siteSettings.pages.seasons && (
          <SeasonsPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'wellness' && siteSettings.pages.wellness && (
          <WellnessPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'restaurant' && siteSettings.pages.restaurant && (
          <RestaurantPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'packages' && siteSettings.pages.packages && (
          <PackagesPage
            lang={lang}
            onSelectPackage={handleSelectPackage}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'contact' && siteSettings.pages.contact && (
          <ContactPage
            lang={lang}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage lang={lang} />
        )}
      </main>

      {/* Global Multilingual AI Chat Concierge with Auto Language Detection (PL, EN, SK, DE) */}
      {siteSettings.components.aiConcierge && (
        <AiChatConcierge currentLang={lang} onOpenBooking={() => handleOpenBooking()} />
      )}

      {/* Comprehensive Footer with Multi-Page Navigation */}
      {siteSettings.components.footer && <Footer
        lang={lang}
        onNavigate={navigateTo}
        onOpenBooking={() => handleOpenBooking()}
      />}

      {/* Floating Bottom Action Bar on Mobile Viewports with subtle slide-in animation */}
      {siteSettings.components.mobileActionBar && <motion.div
        id="mobile-bottom-quick-action" 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#14281E]/95 backdrop-blur-md border-t border-[#2A4F3B] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-between sm:hidden shadow-2xl"
      >
        <a
          href="tel:+48511660511"
          className="flex-1 mr-2 bg-white/10 text-white hover:bg-white/20 active:scale-95 py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>+48 511 660 511</span>
        </a>
        {siteSettings.features.reservations && <button
          onClick={() => handleOpenBooking()}
          className="flex-1 bg-[#D4A373] hover:bg-[#c89260] active:scale-95 text-[#14281E] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.homePage.roomsReserveCta}</span>
        </button>}
      </motion.div>}

      {/* Interactive Reservation Modal with 10% Direct Booking Discount */}
      {siteSettings.features.reservations && <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        lang={lang}
        initialQuery={bookingQuery}
        selectedPackage={selectedPackage}
        preselectedRoomId={preselectedRoomId}
      />}
    </div>
  );
};

export default function App() {
  return (
    <CmsProvider>
      <AppContent />
    </CmsProvider>
  );
}
