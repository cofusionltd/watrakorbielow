import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, BedDouble, Search, Sparkles, ShieldCheck, ExternalLink, CalendarDays } from 'lucide-react';
import { Language, BookingSearchQuery } from '../types';
import { translations } from '../translations';
import { TranslatedDatePicker } from './TranslatedDatePicker';

interface BookingBarProps {
  lang: Language;
  onSearch: (query: BookingSearchQuery) => void;
  onOpenAvailabilityModal?: () => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({ lang, onSearch, onOpenAvailabilityModal }) => {
  const t = translations[lang];

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultCheckout = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(defaultCheckout);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState('all');
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      checkIn,
      checkOut,
      adults,
      children,
      roomType
    });
    if (onOpenAvailabilityModal) {
      onOpenAvailabilityModal();
    }
  };

  return (
    <div id="booking-bar-container" className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* Floating Card */}
      <div className="bg-[#1E3A2B] text-[#F9F8F6] rounded-2xl shadow-2xl shadow-black/30 border border-[#2A4F3B]/80 p-4 sm:p-6 backdrop-blur-md">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 text-xs">
          <div className="flex items-center space-x-2 text-[#D4A373]">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-wider">
              {t.roomsPage.bestPriceGuarantee}
            </span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-white/80 hidden sm:inline">
              {t.common.directDiscountBadge}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-black/25 px-3 py-1 rounded-full border border-white/10 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">{t.bookingBar.bookingPartner}</span>
            <span className="text-white/40">|</span>
            <span className="text-amber-300 font-bold">9.1 / 10</span>
          </div>
        </div>

        {/* Search Form Fields */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Check-In */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-[#D4A373] uppercase tracking-wider mb-1.5">
              {t.bookingBar.checkIn}
            </label>
            <div className="relative flex items-center bg-[#14281E]/90 rounded-xl border border-white/15 px-3 py-2.5 hover:border-[#D4A373] transition-colors">
              <TranslatedDatePicker
                id="booking-checkin-input"
                value={checkIn}
                min={todayStr}
                onChange={(val) => setCheckIn(val)}
                lang={lang}
                className="w-full"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-semibold text-[#D4A373] uppercase tracking-wider mb-1.5">
              {t.bookingBar.checkOut}
            </label>
            <div className="relative flex items-center bg-[#14281E]/90 rounded-xl border border-white/15 px-3 py-2.5 hover:border-[#D4A373] transition-colors">
              <TranslatedDatePicker
                id="booking-checkout-input"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={(val) => setCheckOut(val)}
                lang={lang}
                className="w-full"
              />
            </div>
          </div>

          {/* Guests Popover */}
          <div className="lg:col-span-3 relative">
            <label className="block text-[11px] font-semibold text-[#D4A373] uppercase tracking-wider mb-1.5">
              {t.bookingBar.guests}
            </label>
            <button
              type="button"
              id="booking-guests-dropdown-button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="flex items-center justify-between w-full bg-[#14281E]/90 rounded-xl border border-white/15 px-3 py-2.5 hover:border-[#D4A373] transition-colors text-left"
            >
              <div className="flex items-center space-x-2 truncate">
                <Users className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span className="text-sm font-medium text-[#F9F8F6] truncate">
                  {t.bookingBar.guestsCount(adults, children)}
                </span>
              </div>
            </button>

            {/* Guest counter popover */}
            {showGuestPicker && (
              <div 
                id="guests-selector-popover"
                className="absolute left-0 right-0 top-full mt-2 bg-[#14281E] border border-[#2A4F3B] rounded-xl shadow-2xl p-4 z-50 text-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold">{t.common.adultsLabel}</div>
                    <div className="text-[10px] text-white/60">{t.common.adultsAge}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{adults}</span>
                    <button
                      type="button"
                      disabled={adults >= 8}
                      onClick={() => setAdults(Math.min(8, adults + 1))}
                      className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <div>
                    <div className="text-xs font-semibold">{t.common.childrenLabel}</div>
                    <div className="text-[10px] text-white/60">{t.common.childrenAge}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{children}</span>
                    <button
                      type="button"
                      disabled={children >= 6}
                      onClick={() => setChildren(Math.min(6, children + 1))}
                      className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuestPicker(false)}
                  className="w-full py-1.5 bg-[#D4A373] text-[#14281E] rounded-md text-xs font-bold hover:bg-[#c89260] transition-colors"
                >
                  {t.common.apply}
                </button>
              </div>
            )}
          </div>

          {/* Submit Search CTA Button */}
          <div className="lg:col-span-3">
            <button
              type="submit"
              id="booking-bar-submit-btn"
              className="w-full bg-[#D4A373] hover:bg-[#c89260] active:scale-[0.98] text-[#14281E] font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#14281E]" />
              <span className="text-sm uppercase tracking-wider">{t.bookingBar.checkBtn}</span>
            </button>
          </div>
        </form>

        {/* Bottom micro note */}
        <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-white/60 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.bookingBar.ratingNote}</span>
          </div>
          <div className="flex items-center space-x-4">
            {onOpenAvailabilityModal && (
              <button
                type="button"
                id="booking-bar-open-calendar-link"
                onClick={onOpenAvailabilityModal}
                className="text-[#D4A373] hover:text-[#e4b585] underline font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{t.common.calendarPreview}</span>
              </button>
            )}
            <span>{t.common.freeCancelNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
