import React, { useState, useEffect } from 'react';
import { Phone, Calendar, Menu, X, ChevronDown, Sparkles, MapPin, Globe, Shield, Lock } from 'lucide-react';
import { Language, PageView } from '../types';
import { translations } from '../translations';
import { useCms } from '../context/CmsContext';

interface HeaderProps {
  lang: Language;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onLanguageChange: (lang: Language) => void;
  onOpenBooking: (roomType?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  currentPage,
  onNavigate,
  onLanguageChange,
  onOpenBooking
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { content } = useCms();

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const navItems: { page: PageView; label: string }[] = [
    { page: 'home', label: t.nav.home || 'Główna' },
    { page: 'about', label: t.nav.about },
    { page: 'rooms', label: t.nav.rooms },
    { page: 'seasons', label: t.nav.seasons },
    { page: 'wellness', label: t.nav.wellness },
    { page: 'restaurant', label: t.nav.dining },
    { page: 'packages', label: t.nav.packages },
    { page: 'contact', label: t.nav.contact },
  ];

  const handleLinkClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top micro-bar for quick contact and notice */}
      <div id="top-announcement-bar" className="bg-[#14281E] text-[#F9F8F6]/80 text-xs py-2 px-4 border-b border-[#2A4F3B]/40 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-[#D4A373]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{content.resort.address || 'ul. Graniczna 17, 34-335 Korbielów (Beskid Żywiecki)'}</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="hidden lg:inline text-emerald-400/90 font-medium">
              {t.nav.topNotice || '❄️ 100 m do wyciągów Cypisek & Andiamo • 900 m do stacji Pilsko'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLinkClick('admin')}
              className={`flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-[#D4A373] text-[#14281E]'
                  : 'text-[#D4A373] hover:text-white bg-white/5'
              }`}
              title="Admin"
            >
              <Lock className="w-3 h-3" />
              <span>{t.nav.adminPanel || 'Admin'}</span>
            </button>
            <span className="text-white/40">•</span>
            <a 
              href={`tel:${content.resort.phone || '+48511660511'}`} 
              className="flex items-center space-x-1.5 text-white hover:text-[#D4A373] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="font-mono font-medium">{content.resort.phone || '+48 511 660 511'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <header
        id="main-navigation-bar"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#1E3A2B]/95 backdrop-blur-md shadow-lg shadow-black/20 py-2.5'
            : 'bg-[#1E3A2B] shadow-md py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center space-x-3 group cursor-pointer text-left"
            id="site-logo-link"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-[#D4A373]/60 group-hover:border-[#D4A373] transition-all shrink-0 bg-[#BA926E]">
              <img
                src="/images/logo.png"
                alt="Watra Korbielów Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F9F8F6] group-hover:text-[#D4A373] transition-colors leading-none">
                Watra
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#D4A373] font-semibold mt-1">
                Korbielów
              </span>
            </div>
          </button>

          {/* Desktop Multi-Page Nav Links */}
          <nav className="hidden xl:flex items-center space-x-5 2xl:space-x-6" aria-label="Main Navigation">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleLinkClick(item.page)}
                className={`text-xs font-semibold tracking-wide transition-all py-1.5 px-2 rounded-lg cursor-pointer ${
                  currentPage === item.page
                    ? 'text-[#D4A373] bg-white/10 font-bold'
                    : 'text-[#F9F8F6]/90 hover:text-[#D4A373] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions: Language + Booking CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="language-selector-button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#F9F8F6] bg-white/10 hover:bg-white/15 transition-colors border border-white/10 cursor-pointer"
                aria-label="Wybierz język"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A373]" />
                <span className="uppercase">{lang}</span>
                <ChevronDown className="w-3 h-3 text-[#F9F8F6]/60" />
              </button>

              {langDropdownOpen && (
                <div 
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-2 w-36 bg-[#14281E] border border-[#2A4F3B] rounded-lg shadow-xl py-1.5 z-50"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 transition-colors cursor-pointer ${
                        lang === l.code
                          ? 'bg-[#2A4F3B] text-[#D4A373] font-bold'
                          : 'text-[#F9F8F6]/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Booking Modal CTA */}
            <button
              id="header-booking-cta-button"
              onClick={() => onOpenBooking()}
              className="flex items-center space-x-2 bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <Calendar className="w-3.5 h-3.5 text-[#14281E]" />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center space-x-2 xl:hidden">
            <button
              id="mobile-language-toggle-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="sm:hidden px-2 py-1 text-xs font-bold text-[#F9F8F6] bg-white/10 rounded uppercase"
            >
              {lang}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F9F8F6] hover:text-[#D4A373] rounded-md focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer with all pages */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation-drawer" 
            className="xl:hidden bg-[#14281E] border-t border-[#2A4F3B] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200"
          >
            {/* Languages in Mobile Menu */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-2 border-b border-[#2A4F3B]/50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onLanguageChange(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg flex items-center justify-center space-x-1.5 ${
                    lang === l.code
                      ? 'bg-[#D4A373] text-[#14281E] font-bold'
                      : 'bg-white/5 text-white/80'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* Nav Pages */}
            <div className="flex flex-col space-y-1 pt-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleLinkClick(item.page)}
                  className={`px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-colors flex items-center justify-between ${
                    currentPage === item.page
                      ? 'bg-[#D4A373] text-[#14281E] font-bold'
                      : 'text-[#F9F8F6] hover:bg-[#2A4F3B]'
                  }`}
                >
                  <span>{item.label}</span>
                  {currentPage === item.page && <span className="text-xs">●</span>}
                </button>
              ))}

              <button
                onClick={() => handleLinkClick('admin')}
                className={`px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-colors flex items-center space-x-2 ${
                  currentPage === 'admin'
                    ? 'bg-[#D4A373] text-[#14281E] font-bold'
                    : 'text-[#D4A373] hover:bg-[#2A4F3B]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t.nav.adminPanel || 'Admin'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#2A4F3B]/60 space-y-2">
              <a
                href="tel:+48511660511"
                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium"
              >
                <Phone className="w-4 h-4 text-[#D4A373]" />
                <span>+48 511 660 511</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-[#D4A373] text-[#14281E] font-bold rounded-xl text-sm shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.nav.bookNow}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
