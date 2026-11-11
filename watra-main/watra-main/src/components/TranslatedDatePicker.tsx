import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Language } from '../types';

interface TranslatedDatePickerProps {
  id?: string;
  value: string; // YYYY-MM-DD
  min?: string;  // YYYY-MM-DD
  max?: string;  // YYYY-MM-DD
  onChange: (date: string) => void;
  lang: Language;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTH_NAMES: Record<Language, string[]> = {
  pl: [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  de: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ],
  sk: [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ]
};

const DAY_NAMES: Record<Language, string[]> = {
  pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  sk: ['Po', 'Ut', 'St', 'Št', 'Pia', 'So', 'Ne']
};

const UI_TEXT: Record<Language, { today: string; clear: string; selectDate: string }> = {
  pl: { today: 'Dzisiaj', clear: 'Wyczyść', selectDate: 'Wybierz datę' },
  en: { today: 'Today', clear: 'Clear', selectDate: 'Select date' },
  de: { today: 'Heute', clear: 'Löschen', selectDate: 'Datum wählen' },
  sk: { today: 'Dnes', clear: 'Vymazať', selectDate: 'Vybrať dátum' }
};

export const TranslatedDatePicker: React.FC<TranslatedDatePickerProps> = ({
  id,
  value,
  min,
  max,
  onChange,
  lang,
  placeholder,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date for view
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentMonthName = MONTH_NAMES[lang][viewMonth];
  const daysHeader = DAY_NAMES[lang];
  const tUI = UI_TEXT[lang];

  // Calendar calculations
  // First day of current view month: 0=Sun, 1=Mon, ..., 6=Sat
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startingDayIndex = (firstDay + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const isDateDisabled = (dateStr: string) => {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatDateString(viewYear, viewMonth, day);
    if (isDateDisabled(dateStr)) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleTodayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const todayStr = formatDateString(now.getFullYear(), now.getMonth(), now.getDate());
    if (!isDateDisabled(todayStr)) {
      onChange(todayStr);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
      setIsOpen(false);
    }
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Formatted display text
  const displayFormattedDate = () => {
    if (!value) return placeholder || tUI.selectDate;
    const d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return value;
    const day = d.getDate();
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    if (lang === 'pl') {
      const monthGenitive = [
        'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
        'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
      ][monthIndex];
      return `${day} ${monthGenitive} ${year}`;
    }
    if (lang === 'de') {
      return `${day}. ${MONTH_NAMES.de[monthIndex]} ${year}`;
    }
    if (lang === 'sk') {
      return `${day}. ${MONTH_NAMES.sk[monthIndex]} ${year}`;
    }
    return `${MONTH_NAMES.en[monthIndex]} ${day}, ${year}`;
  };

  const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left bg-transparent text-sm text-[#F9F8F6] focus:outline-none font-medium cursor-pointer"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {displayFormattedDate()}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#D4A373] ml-2 shrink-0 opacity-80 group-hover:opacity-100" />
      </button>

      {/* Floating Translated Pop-up Calendar */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#14281E] border border-[#2A4F3B] rounded-2xl shadow-2xl p-4 z-50 text-[#F9F8F6] animate-in fade-in zoom-in-95 duration-150 select-none backdrop-blur-xl"
          style={{ minWidth: '280px' }}
        >
          {/* Header with Month / Year and Navigation */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center font-bold text-sm text-[#F9F8F6] tracking-wide">
              <span>{currentMonthName}</span> <span className="text-[#D4A373] font-mono">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysHeader.map((dName, idx) => (
              <div
                key={idx}
                className={`text-[11px] font-semibold py-1 ${idx >= 5 ? 'text-[#D4A373]/80' : 'text-white/60'}`}
              >
                {dName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month trailing days */}
            {Array.from({ length: startingDayIndex }).map((_, idx) => {
              const dayNum = daysInPrevMonth - startingDayIndex + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="text-xs text-white/20 py-2 rounded-lg cursor-not-allowed"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDateString(viewYear, viewMonth, dayNum);
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const isDisabled = isDateDisabled(dateStr);

              let btnClasses = 'text-xs py-2 rounded-xl font-medium transition-all cursor-pointer ';
              if (isSelected) {
                btnClasses += 'bg-[#D4A373] text-[#14281E] font-bold shadow-md shadow-[#D4A373]/30 scale-105';
              } else if (isDisabled) {
                btnClasses += 'text-white/20 cursor-not-allowed';
              } else if (isToday) {
                btnClasses += 'border border-[#D4A373] text-[#D4A373] hover:bg-[#D4A373]/20';
              } else {
                btnClasses += 'text-white/90 hover:bg-white/10 hover:text-white';
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(dayNum)}
                  className={btnClasses}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Actions: Today & Clear */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={handleClearClick}
              className="text-white/60 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-white/5"
            >
              {tUI.clear}
            </button>

            <button
              type="button"
              onClick={handleTodayClick}
              className="text-[#D4A373] font-semibold hover:text-[#e4b585] transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-[#D4A373]/10"
            >
              {tUI.today}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
