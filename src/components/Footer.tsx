import { CmsManagedImage } from './CmsManagedImage';
import React from 'react';
import { Phone, Mail, MapPin, Clock, CreditCard, ShieldCheck, Heart, ExternalLink, Instagram, Facebook, Lock } from 'lucide-react';
import { Language, PageView } from '../types';
import {useCms, useCmsTranslations} from '../context/CmsContext';

interface FooterProps {
  lang: Language;
  onNavigate: (page: PageView) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate, onOpenBooking }) => {
  const t = useCmsTranslations(lang);
  const { content, siteSettings } = useCms();
  const navigationItems = ([
    { page: 'home', label: t.footerExtra?.homeLink || 'Strona Główna' },
    { page: 'about', label: t.footerExtra?.aboutLink || 'O nas & Położenie' },
    { page: 'rooms', label: t.footerExtra?.roomsLink || 'Pokoje & Cennik' },
    { page: 'seasons', label: t.footerExtra?.seasonsLink || 'Zima & Lato w Beskidach' },
    { page: 'wellness', label: t.footerExtra?.wellnessLink || 'Jacuzzi & Sauna' },
    { page: 'restaurant', label: t.footerExtra?.restaurantLink || 'Restauracja & Grill' },
    { page: 'packages', label: t.footerExtra?.packagesLink || 'Pakiety & Promocje' },
    { page: 'contact', label: t.footerExtra?.contactLink || 'Kontakt & Dojazd' },
  ] satisfies { page: Exclude<PageView, 'admin'>; label: string }[])
    .filter(({ page }) => siteSettings.pages[page]);

  const handlePageClick = (page: PageView) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!siteSettings.components.footer) return null;

  return (
    <footer id="footer-section" className="bg-[#14281E] text-white pt-16 pb-12 border-t border-[#2A4F3B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-column footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-[#D4A373] shrink-0 bg-[#BA926E]">
                <CmsManagedImage
                  src="/images/logo.png"
                  alt="Watra Korbielów"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white leading-none block">
                  Watra Korbielów
                </span>
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#D4A373] font-semibold">
                  {t.footerExtra?.brandDescriptor || 'Ośrodek • Restauracja'}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              {lang === 'pl'
                ? content.footer.aboutSnippet || t.footerExtra?.aboutSnippet
                : t.footerExtra?.aboutSnippet || content.footer.aboutSnippet}
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{t.footerExtra?.directGuarantee || 'Gwarancja rezerwacji bezpośredniej: -10% i darmowy parking'}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
              {t.footer.addressTitle}
            </h3>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>{content.resort.address || 'ul. Graniczna 17, 34-335 Korbielów'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`tel:${content.resort.phone || '+48511660511'}`} className="hover:text-[#D4A373] transition-colors font-bold text-white">
                  {content.resort.phone || '+48 511 660 511'}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`mailto:${content.resort.email || 'biuro@watrakorbielow.pl'}`} className="hover:text-[#D4A373] transition-colors">
                  {content.resort.email || 'biuro@watrakorbielow.pl'}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>{t.footer.receptionHours || 'Recepcja: 8:00 – 21:00'}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Bank Account for Deposits */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
              {t.footer.bankAccountTitle}
            </h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-white/80 font-semibold">
                <CreditCard className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Bank Pekao SA</span>
              </div>
              <div className="font-mono text-[11px] text-amber-200 tracking-wider break-all bg-black/30 p-2 rounded border border-white/5">
                61 1240 4533 1111 0011 3171 8707
              </div>
              <p className="text-[10px] text-white/60">
                {t.footerExtra?.depositNote || 'W tytule prosimy wpisać nazwisko oraz termin rezerwacji.'}
              </p>
            </div>
          </div>

          {/* Col 4: Multi-Page Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
              {t.footerExtra?.pagesTitle || 'Strony & Sekcje'}
            </h3>
            <ul className="space-y-1.5 text-xs text-white/80">
              {navigationItems.map(({ page, label }) => (
                <li key={page}>
                  <button onClick={() => handlePageClick(page)} className="hover:text-[#D4A373] transition-colors cursor-pointer text-left">
                    {label}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button onClick={() => handlePageClick('admin')} className="text-[#D4A373] hover:text-white transition-colors cursor-pointer flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>{t.footerExtra?.adminLink || 'Panel Administratora'}</span>
                </button>
              </li>
            </ul>

            {siteSettings.features.reservations && <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] font-bold text-xs uppercase py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                {t.footerExtra?.bookOnlineBtn || 'Rezerwuj online'}
              </button>
            </div>}
          </div>
        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div>
            © {new Date().getFullYear()} Watra Korbielów. {t.footerExtra?.rightsReserved || 'Wszelkie prawa zastrzeżone.'}
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://watrakorbielow.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              watrakorbielow.pl
            </a>
            <span>•</span>
            <a
              href="https://www.booking.com/hotel/pl/watra-korbielow.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D4A373] transition-colors"
            >
              Booking.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
