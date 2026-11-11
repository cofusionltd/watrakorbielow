import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Bed, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Users, 
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { Language, Room, BookingSearchQuery } from '../types';
import { useRooms } from '../hooks/useRooms';

interface AvailabilityCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectDatesAndBook: (query: { roomId: string; checkIn: string; checkOut: string; adults: number }) => void;
}

interface BlockedRange {
  id: string;
  checkIn: string;
  checkOut: string;
  source: 'website' | 'booking_com';
  guestName?: string;
  status: string;
}

interface RoomCalendarData {
  [roomId: string]: BlockedRange[];
}

const TRANSLATIONS: Record<Language, {
  modalTitle: string;
  modalSubtitle: string;
  liveSync: string;
  noOverbooking: string;
  selectRoomLabel: string;
  clickInstruction: string;
  freeAvailable: string;
  bookedWeb: string;
  blockedBooking: string;
  selectedRange: string;
  syncLive: string;
  selectedStay: string;
  selectDatesPrompt: string;
  checkInLabel: string;
  checkOutSelectPrompt: string;
  clickFirstFreeDay: string;
  to: string;
  nightSingle: string;
  nightPlural: string;
  priceDirectLabel: string;
  priceBookingLabel: string;
  bookBtn: string;
  cellArrival: string;
  cellDeparture: string;
  cellUnavailable: string;
  cellBooked: string;
  perNight: string;
  maxPersons: string;
  allRoomsCount: string;
}> = {
  pl: {
    modalTitle: 'Sprawdź Dostępność Resortu Watra • Widok Kalendarza',
    modalSubtitle: 'Dwukierunkowy Channel Manager z Booking.com aktywny (ochrona przed kolizją terminów)',
    liveSync: 'LIVE SYNC',
    noOverbooking: 'Gwarancja braku overbookingu',
    selectRoomLabel: 'Wybierz pokój z listy do podglądu terminów:',
    clickInstruction: 'Kliknij datę przyjazdu, a następnie wyjazdu, aby sprawdzić cenę',
    freeAvailable: 'Wolny (dostępny do rezerwacji)',
    bookedWeb: 'Zarezerwowane (strona WWW)',
    blockedBooking: 'Zablokowane przez Booking.com (iCal)',
    selectedRange: 'Wybrany termin',
    syncLive: 'Status synchronizacji: Na żywo',
    selectedStay: 'Wybrany termin rezerwacji:',
    selectDatesPrompt: 'Wybierz daty na kalendarzu powyżej:',
    checkInLabel: 'Przyjazd',
    checkOutSelectPrompt: 'Wybierz dzień wyjazdu na kalendarzu.',
    clickFirstFreeDay: 'Wybierz pierwszy wolny dzień na kalendarzu, aby rozpocząć rezerwację.',
    to: 'do',
    nightSingle: 'noc',
    nightPlural: 'noce',
    priceDirectLabel: 'U nas (-10%):',
    priceBookingLabel: 'Booking.com:',
    bookBtn: 'Rezerwuj Wybrany Termin (-10%)',
    cellArrival: 'Przyjazd',
    cellDeparture: 'Wyjazd',
    cellUnavailable: 'Niedostępny',
    cellBooked: 'Zajęte',
    perNight: '/ noc',
    maxPersons: 'do',
    allRoomsCount: 'Dostępne pokoje w bazie'
  },
  en: {
    modalTitle: 'Check Watra Resort Availability • Calendar View',
    modalSubtitle: 'Two-way Channel Manager with Booking.com active (real-time overbooking protection)',
    liveSync: 'LIVE SYNC',
    noOverbooking: 'Guaranteed no overbooking',
    selectRoomLabel: 'Select a room from dropdown to check dates:',
    clickInstruction: 'Click check-in date, then check-out date to calculate price',
    freeAvailable: 'Available for booking',
    bookedWeb: 'Booked (direct website)',
    blockedBooking: 'Blocked by Booking.com (iCal)',
    selectedRange: 'Selected dates',
    syncLive: 'Sync status: Live',
    selectedStay: 'Selected booking stay:',
    selectDatesPrompt: 'Select dates on the calendar above:',
    checkInLabel: 'Check-in',
    checkOutSelectPrompt: 'Select your check-out day on the calendar.',
    clickFirstFreeDay: 'Click the first available day on the calendar to start booking.',
    to: 'to',
    nightSingle: 'night',
    nightPlural: 'nights',
    priceDirectLabel: 'Direct (-10%):',
    priceBookingLabel: 'Booking.com:',
    bookBtn: 'Book Selected Dates (-10%)',
    cellArrival: 'Arrival',
    cellDeparture: 'Departure',
    cellUnavailable: 'Unavailable',
    cellBooked: 'Booked',
    perNight: '/ night',
    maxPersons: 'up to',
    allRoomsCount: 'Rooms in database'
  },
  de: {
    modalTitle: 'Verfügbarkeit des Watra Resorts Prüfen • Kalenderansicht',
    modalSubtitle: 'Zwei-Wege-Channel-Manager mit Booking.com aktiv (Echtzeit-Überbuchungsschutz)',
    liveSync: 'LIVE SYNC',
    noOverbooking: 'Garantierter Überbuchungsschutz',
    selectRoomLabel: 'Wählen Sie ein Zimmer aus dem Dropdown-Menü:',
    clickInstruction: 'Klicken Sie auf Anreise- und Abreisedatum, um den Preis zu sehen',
    freeAvailable: 'Verfügbar zur Buchung',
    bookedWeb: 'Gebucht (Direktbuchung)',
    blockedBooking: 'Blockiert über Booking.com (iCal)',
    selectedRange: 'Ausgewählter Zeitraum',
    syncLive: 'Synchronisationsstatus: Live',
    selectedStay: 'Ausgewählter Buchungszeitraum:',
    selectDatesPrompt: 'Wählen Sie Daten im Kalender oben:',
    checkInLabel: 'Anreise',
    checkOutSelectPrompt: 'Wählen Sie das Abreisedatum im Kalender.',
    clickFirstFreeDay: 'Klicken Sie auf den ersten freien Tag, um die Buchung zu starten.',
    to: 'bis',
    nightSingle: 'Nacht',
    nightPlural: 'Nächte',
    priceDirectLabel: 'Bei uns (-10%):',
    priceBookingLabel: 'Booking.com:',
    bookBtn: 'Ausgewählten Termin Buchen (-10%)',
    cellArrival: 'Anreise',
    cellDeparture: 'Abreise',
    cellUnavailable: 'Nicht verfügbar',
    cellBooked: 'Belegt',
    perNight: '/ Nacht',
    maxPersons: 'bis zu',
    allRoomsCount: 'Zimmer in der Datenbank'
  },
  sk: {
    modalTitle: 'Overiť Dostupnosť Rezortu Watra • Kalendárové Zobrazenie',
    modalSubtitle: 'Obojsmerný Channel Manager s Booking.com aktívny (ochrana pred prebukovaním)',
    liveSync: 'LIVE SYNC',
    noOverbooking: 'Garancia bez prebukovania',
    selectRoomLabel: 'Vyberte izbu z rozbaľovacieho zoznamu pre náhľad termínov:',
    clickInstruction: 'Kliknite na dátum príchodu a následne odchodu pre kontrolu ceny',
    freeAvailable: 'Voľné (k dispozícii na rezerváciu)',
    bookedWeb: 'Rezervované (priamo cez web)',
    blockedBooking: 'Blokované cez Booking.com (iCal)',
    selectedRange: 'Vybraný termín',
    syncLive: 'Stav synchronizácie: Naživo',
    selectedStay: 'Vybraný termín rezervácie:',
    selectDatesPrompt: 'Vyberte dátumy v kalendári vyššie:',
    checkInLabel: 'Príchod',
    checkOutSelectPrompt: 'Vyberte deň odchodu na kalendári.',
    clickFirstFreeDay: 'Kliknite na prvý voľný deň v kalendári pre začatie rezervácie.',
    to: 'do',
    nightSingle: 'noc',
    nightPlural: 'noci',
    priceDirectLabel: 'U nás (-10%):',
    priceBookingLabel: 'Booking.com:',
    bookBtn: 'Rezervovať Vybraný Termín (-10%)',
    cellArrival: 'Príchod',
    cellDeparture: 'Odchod',
    cellUnavailable: 'Nedostupné',
    cellBooked: 'Obsadené',
    perNight: '/ noc',
    maxPersons: 'do',
    allRoomsCount: 'Dostupné izby v databáze'
  }
};

const MONTH_NAMES: Record<Language, string[]> = {
  pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  sk: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December']
};

const DAY_NAMES: Record<Language, string[]> = {
  pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  sk: ['Po', 'Ut', 'St', 'Št', 'Pia', 'So', 'Ne']
};

export const AvailabilityCalendarModal: React.FC<AvailabilityCalendarModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectDatesAndBook
}) => {
  const { rooms } = useRooms();
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.pl;

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)
  const [calendarData, setCalendarData] = useState<RoomCalendarData>({});
  const [isLoading, setIsLoading] = useState(false);

  // Date selection state on the calendar
  const [selectedCheckIn, setSelectedCheckIn] = useState<string>('');
  const [selectedCheckOut, setSelectedCheckOut] = useState<string>('');

  // Default selected room when rooms are loaded
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const roomIds = rooms.map(r => r.id);
    
    Promise.all(
      roomIds.map(rId => 
        fetch(`/api/booking/calendar/${rId}`)
          .then(res => res.json())
          .then(data => ({ roomId: rId, blockedRanges: data.blockedRanges || [] }))
          .catch(() => ({ roomId: rId, blockedRanges: [] }))
      )
    ).then(results => {
      const dataMap: RoomCalendarData = {};
      results.forEach(r => {
        dataMap[r.roomId] = r.blockedRanges;
      });
      setCalendarData(dataMap);
      setIsLoading(false);
    });
  }, [isOpen, rooms]);

  if (!isOpen) return null;

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0] || {
    id: 'room-default',
    name: 'Pokój Standard',
    basePrice: 320,
    capacity: 2,
    size: '22 m²',
    bedConfig: '1 łóżko podwójne',
    images: ['/images/image-10.jpg'],
    category: 'double'
  };

  const monthName = MONTH_NAMES[lang][currentMonth];
  const daysHeader = DAY_NAMES[lang];

  // Helper date functions
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday=0

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Check if a given day is blocked for the selected room
  const checkDayStatus = (dateStr: string, roomId: string) => {
    const ranges = calendarData[roomId] || [];
    for (const r of ranges) {
      if (dateStr >= r.checkIn && dateStr < r.checkOut) {
        return {
          blocked: true,
          source: r.source,
          range: r
        };
      }
    }
    return { blocked: false, source: null, range: null };
  };

  // Day click logic for date range selection
  const handleDayClick = (dateStr: string, isBlocked: boolean) => {
    if (isBlocked) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut('');
    } else if (selectedCheckIn && !selectedCheckOut) {
      if (dateStr > selectedCheckIn) {
        let hasConflict = false;
        const start = new Date(selectedCheckIn);
        const end = new Date(dateStr);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          const ds = d.toISOString().split('T')[0];
          if (checkDayStatus(ds, selectedRoomId).blocked) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          setSelectedCheckIn(dateStr);
          setSelectedCheckOut('');
        } else {
          setSelectedCheckOut(dateStr);
        }
      } else {
        setSelectedCheckIn(dateStr);
        setSelectedCheckOut('');
      }
    }
  };

  // Calculate pricing summary for selected range
  let nightsCount = 0;
  let estimatedPriceDirect = 0;
  let estimatedPriceBookingCom = 0;

  if (selectedCheckIn && selectedCheckOut) {
    const start = new Date(selectedCheckIn);
    const end = new Date(selectedCheckOut);
    nightsCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = activeRoom.basePrice * nightsCount;
    estimatedPriceBookingCom = baseTotal;
    estimatedPriceDirect = Math.round(baseTotal * 0.9); // 10% direct booking discount
  }

  const handleProceedToBooking = () => {
    if (!selectedCheckIn) return;
    const finalCheckOut = selectedCheckOut || formatDateStr(
      new Date(selectedCheckIn).getFullYear(),
      new Date(selectedCheckIn).getMonth(),
      new Date(selectedCheckIn).getDate() + 2
    );

    onSelectDatesAndBook({
      roomId: activeRoom.id,
      checkIn: selectedCheckIn,
      checkOut: finalCheckOut,
      adults: activeRoom.capacity || 2
    });
    onClose();
  };

  return (
    <div
      id="availability-calendar-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#14281E] border border-[#D4A373]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#F9F8F6] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Navigation Header */}
        <div className="bg-[#1E3A2B] px-5 sm:px-8 py-4 sm:py-5 border-b border-[#2A4F3B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A373] text-[#14281E] flex items-center justify-center font-bold shadow-md shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F9F8F6]">
                  {tr.modalTitle}
                </h3>
                <span className="hidden sm:inline-block bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {tr.liveSync}
                </span>
              </div>
              <p className="text-xs text-white/70">
                {tr.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-black/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{tr.noOverbooking}</span>
            </div>

            <button
              onClick={onClose}
              id="close-availability-modal-btn"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Zamknij kalendarz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Central Room Selector: Dropdown box with image preview & scrollable list */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
                {tr.selectRoomLabel}
              </label>
              <span className="text-[11px] text-white/60">
                {tr.allRoomsCount}: <strong className="text-white">{rooms.length}</strong>
              </span>
            </div>

            {/* Selected Room Trigger Box */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#1E3A2B] hover:bg-[#254836] border border-[#D4A373]/50 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-lg transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <img
                  src={activeRoom.images?.[0] || '/images/image-10.jpg'}
                  alt={activeRoom.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/20 shrink-0 shadow-xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#F9F8F6] truncate">
                      {activeRoom.name}
                    </span>
                    <span className="bg-[#D4A373]/20 text-[#D4A373] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4A373]/30 uppercase shrink-0">
                      -10% bezpośrednio
                    </span>
                  </div>
                  <div className="text-xs text-white/70 mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>{tr.maxPersons} {activeRoom.capacity} os.</span>
                    <span>•</span>
                    <span>{activeRoom.size}</span>
                    <span>•</span>
                    <span className="text-white/60 truncate">{activeRoom.bedConfig}</span>
                  </div>
                  <div className="text-xs font-mono text-[#D4A373] font-bold mt-1">
                    od {Math.round(activeRoom.basePrice * 0.9)} zł <span className="text-[10px] font-normal text-white/60">{tr.perNight}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pl-3 shrink-0">
                <span className="hidden sm:inline-block text-xs font-semibold text-[#D4A373] group-hover:underline">
                  Zmień pokój
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/20 transition-colors">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>

            {/* Scrollable Room Dropdown Box with Image Previews */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1A3326] border border-[#D4A373] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 bg-[#14281E] border-b border-white/10 text-xs font-semibold text-[#D4A373] flex items-center justify-between">
                  <span>Dostępne pokoje w centralnej bazie ({rooms.length})</span>
                  <span className="text-[10px] text-white/60">Przewiń, aby zobaczyć wszystkie</span>
                </div>

                <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-white/10 scrollbar-thin">
                  {rooms.map(room => {
                    const isCurrent = room.id === activeRoom.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setSelectedCheckIn('');
                          setSelectedCheckOut('');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full p-3 sm:p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#2A4F3B] text-white'
                            : 'hover:bg-[#203D2E] text-white/90'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={room.images?.[0] || '/images/image-10.jpg'}
                            alt={room.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/15 shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="font-bold text-xs sm:text-sm truncate">{room.name}</div>
                              {isCurrent && (
                                <span className="bg-[#D4A373] text-[#14281E] text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                  Wybrany
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/60 mt-0.5">
                              {tr.maxPersons} {room.capacity} os. • {room.size} • {room.bedConfig}
                            </div>
                            <div className="text-xs font-mono font-bold text-[#D4A373] mt-1">
                              od {Math.round(room.basePrice * 0.9)} zł <span className="text-[10px] font-normal text-white/60">{tr.perNight}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-3">
                          {isCurrent ? (
                            <div className="w-6 h-6 rounded-full bg-[#D4A373] text-[#14281E] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <span className="text-[11px] text-white/40 hover:text-white">Wybierz</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Month Header & Navigation */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                id="cal-prev-month-btn"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Poprzedni miesiąc"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-lg font-serif font-bold tracking-wide px-3">
                <span>{monthName}</span> <span className="text-[#D4A373] font-mono">{currentYear}</span>
              </div>

              <button
                onClick={handleNextMonth}
                id="cal-next-month-btn"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Następny miesiąc"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick helper tip */}
            <div className="text-xs text-white/70 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D4A373] animate-pulse" />
              <span>{tr.clickInstruction}</span>
            </div>
          </div>

          {/* Days Grid */}
          <div className="bg-black/20 border border-white/10 rounded-3xl p-3 sm:p-5">
            {/* Header: Days of Week */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
              {daysHeader.map((dName, idx) => (
                <div
                  key={idx}
                  className={`text-xs font-bold py-2 ${idx >= 5 ? 'text-[#D4A373]' : 'text-white/60'}`}
                >
                  {dName}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Previous Month trailing days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => {
                const dayNum = daysInPrevMonth - firstDayIndex + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    className="min-h-[60px] sm:min-h-[74px] p-2 rounded-2xl bg-black/10 text-white/20 border border-transparent flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold">{dayNum}</span>
                  </div>
                );
              })}

              {/* Current Month days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
                const dayStatus = checkDayStatus(dateStr, activeRoom.id);
                const isBlocked = dayStatus.blocked;
                const isBookingCom = dayStatus.source === 'booking_com';

                const isStart = dateStr === selectedCheckIn;
                const isEnd = dateStr === selectedCheckOut;
                const isInRange = selectedCheckIn && selectedCheckOut && dateStr >= selectedCheckIn && dateStr <= selectedCheckOut;

                // Cell styling
                let cellClasses = 'min-h-[60px] sm:min-h-[74px] p-2 sm:p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between select-none ';

                if (isBlocked) {
                  cellClasses += isBookingCom
                    ? 'bg-amber-950/40 border-amber-800/40 text-amber-200/80 cursor-not-allowed opacity-85'
                    : 'bg-red-950/40 border-red-800/40 text-red-200/80 cursor-not-allowed opacity-85';
                } else if (isStart || isEnd) {
                  cellClasses += 'bg-[#D4A373] border-[#D4A373] text-[#14281E] font-bold shadow-lg scale-102 z-10';
                } else if (isInRange) {
                  cellClasses += 'bg-[#D4A373]/25 border-[#D4A373]/60 text-white';
                } else {
                  cellClasses += 'bg-[#1E3A2B]/70 hover:bg-[#2A4F3B] border-emerald-500/20 hover:border-emerald-500/40 text-white cursor-pointer';
                }

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => handleDayClick(dateStr, isBlocked)}
                    className={cellClasses}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isStart || isEnd ? 'text-[#14281E]' : ''}`}>
                        {dayNum}
                      </span>
                      {isBlocked ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isBookingCom ? 'bg-amber-900/80 text-amber-200' : 'bg-red-900/80 text-red-200'
                        }`}>
                          {isBookingCom ? 'Booking.com' : tr.cellBooked}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </div>

                    <div className="mt-1">
                      {isBlocked ? (
                        <span className="text-[10px] text-white/50 block truncate">{tr.cellUnavailable}</span>
                      ) : isStart ? (
                        <span className="text-[10px] text-[#14281E] font-bold block">{tr.cellArrival}</span>
                      ) : isEnd ? (
                        <span className="text-[10px] text-[#14281E] font-bold block">{tr.cellDeparture}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-300/90 font-mono block">
                          {Math.round(activeRoom.basePrice * 0.9)} zł
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-[#1E3A2B] border border-emerald-500/50" />
                <span>{tr.freeAvailable}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-red-950 border border-red-800" />
                <span>{tr.bookedWeb}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-amber-950 border border-amber-800" />
                <span>{tr.blockedBooking}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-[#D4A373]" />
                <span>{tr.selectedRange}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{tr.syncLive}</span>
            </div>
          </div>

          {/* Selection Bottom Action Bar */}
          <div className="bg-gradient-to-r from-[#1E3A2B] via-[#2A4F3B] to-[#1E3A2B] border border-[#D4A373]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#D4A373] font-semibold uppercase tracking-wider">
                {selectedCheckIn && selectedCheckOut ? tr.selectedStay : tr.selectDatesPrompt}
              </div>
              {selectedCheckIn && selectedCheckOut ? (
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {selectedCheckIn} <span className="text-[#D4A373]">{tr.to}</span> {selectedCheckOut} ({nightsCount} {nightsCount === 1 ? tr.nightSingle : tr.nightPlural})
                </div>
              ) : selectedCheckIn ? (
                <div className="text-sm text-white/80 mt-0.5">
                  {tr.checkInLabel}: <strong className="text-white">{selectedCheckIn}</strong>. {tr.checkOutSelectPrompt}
                </div>
              ) : (
                <div className="text-sm text-white/70 mt-0.5">
                  {tr.clickFirstFreeDay}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {selectedCheckIn && selectedCheckOut && (
                <div className="text-right">
                  <div className="text-[11px] text-white/60 line-through">
                    {tr.priceBookingLabel} {estimatedPriceBookingCom} zł
                  </div>
                  <div className="text-lg font-bold text-[#D4A373] font-mono">
                    {tr.priceDirectLabel} {estimatedPriceDirect} zł
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedCheckIn}
                onClick={handleProceedToBooking}
                className="bg-[#D4A373] hover:bg-[#c89260] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-[#14281E] font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all cursor-pointer shrink-0"
              >
                <span>{tr.bookBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
