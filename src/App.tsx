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
import { CmsProvider } from './context/CmsContext';
import { motion } from 'motion/react';
import { translations } from './translations';

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

export default function App() {
  const [lang, setLang] = useState<Language>('pl');
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingQuery, setBookingQuery] = useState<BookingSearchQuery | undefined>(undefined);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState<PackageOffer | null>(null);

  // Initialize and listen to hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const page = PAGE_HASH_MAP[hash];
      if (page) {
        setCurrentPage(page);
      } else if (hash && hash !== '#') {
        // Fallback for unknown hash routes
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    window.location.hash = HASH_FOR_PAGE[page];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (roomId?: string) => {
    setSelectedPackage(null);
    setPreselectedRoomId(roomId);
    setIsBookingModalOpen(true);
  };

  const handleSearchFromBar = (query: BookingSearchQuery) => {
    setBookingQuery(query);
    setPreselectedRoomId(query.roomType === 'all' ? undefined : query.roomType);
    setSelectedPackage(null);
    setIsBookingModalOpen(true);
  };

  const handleSelectPackage = (pkg: PackageOffer) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  return (
    <CmsProvider>
      <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#222222] font-sans antialiased selection:bg-[#D4A373]/30 selection:text-[#1E3A2B]">
      {/* Sticky Header with Multi-Page Navigation & Language Switcher */}
      <Header
        lang={lang}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLanguageChange={setLang}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Real-time Visitor Telemetry Tracker */}
      <AnalyticsTracker currentPage={currentPage} />

      {/* Main Multi-Page Routed View */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage
            lang={lang}
            onNavigate={navigateTo}
            onSearch={handleSearchFromBar}
            onOpenBooking={handleOpenBooking}
            onSelectPackage={handleSelectPackage}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'rooms' && (
          <RoomsPage
            lang={lang}
            onSelectRoom={(roomId) => handleOpenBooking(roomId)}
          />
        )}

        {currentPage === 'seasons' && (
          <SeasonsPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'wellness' && (
          <WellnessPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'restaurant' && (
          <RestaurantPage
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'packages' && (
          <PackagesPage
            lang={lang}
            onSelectPackage={handleSelectPackage}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            lang={lang}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Global Multilingual AI Chat Concierge with Auto Language Detection (PL, EN, SK, DE) */}
      <AiChatConcierge currentLang={lang} onOpenBooking={() => handleOpenBooking()} />

      {/* Comprehensive Footer with Multi-Page Navigation */}
      <Footer
        lang={lang}
        onNavigate={navigateTo}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Floating Bottom Action Bar on Mobile Viewports with subtle slide-in animation */}
      <motion.div 
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
        <button
          onClick={() => handleOpenBooking()}
          className="flex-1 bg-[#D4A373] hover:bg-[#c89260] active:scale-95 text-[#14281E] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{translations[lang].homePage.roomsReserveCta}</span>
        </button>
      </motion.div>

      {/* Interactive Reservation Modal with 10% Direct Booking Discount */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        lang={lang}
        initialQuery={bookingQuery}
        selectedPackage={selectedPackage}
        preselectedRoomId={preselectedRoomId}
      />
    </div>
    </CmsProvider>
  );
}
