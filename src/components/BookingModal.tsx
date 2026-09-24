import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Check, Sparkles, ExternalLink, ShieldCheck, CheckCircle2, Bed, Phone, Mail, Clock, AlertTriangle, RefreshCw, Utensils, Coffee, Tag, AlertCircle, Percent } from 'lucide-react';
import { Language, BookingSearchQuery, Room, PackageOffer } from '../types';
import { translations } from '../translations';
import { useRooms } from '../hooks/useRooms';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialQuery?: BookingSearchQuery;
  selectedPackage?: PackageOffer | null;
  preselectedRoomId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialQuery,
  selectedPackage,
  preselectedRoomId
}) => {
  const t = translations[lang];
  const { rooms } = useRooms();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultCheckout = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(initialQuery?.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialQuery?.checkOut || defaultCheckout);
  const [adults, setAdults] = useState(initialQuery?.adults || 2);
  const [children, setChildren] = useState(initialQuery?.children || 0);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || (rooms[0]?.id || 'pokoj-standard-2os'));

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'arrival'>('transfer');
  const [includeBreakfast, setIncludeBreakfast] = useState(true);
  const [includeDinner, setIncludeDinner] = useState(false);
  const [includeJacuzziPass, setIncludeJacuzziPass] = useState(false);
  const [includeSkiRental, setIncludeSkiRental] = useState(false);

  // Real-time Availability & Overbooking Protection State
  const [availability, setAvailability] = useState<{
    checking: boolean;
    available: boolean;
    conflict?: {
      source: 'website' | 'booking_com';
      checkIn: string;
      checkOut: string;
      description: string;
    } | null;
    message: string;
    syncedWithBookingCom: boolean;
  }>({
    checking: false,
    available: true,
    conflict: null,
    message: '',
    syncedWithBookingCom: true
  });

  // Submission results
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Promo code / Kod rabatowy state
  const [promoCodeInput, setPromoCodeInput] = useState<string>(initialQuery?.promoCode || '');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercentage: number;
    title: string;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoValidationStatus, setPromoValidationStatus] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  // Calculate nights
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const totalGuests = (Number(adults) || 1) + (Number(children) || 0);

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const basePriceTotal = (activeRoom ? activeRoom.basePrice : 320) * nights;
  
  // Real-time promo discount rate: if valid promo applied, use promo discount (at least 10%), otherwise standard 10%
  const activeDiscountPercentage = appliedPromo ? Math.max(10, appliedPromo.discountPercentage) : 10;
  const directPriceTotal = Math.round(basePriceTotal * (1 - (activeDiscountPercentage / 100)));
  const savings = basePriceTotal - directPriceTotal;

  // Addons & Meals calculations
  const breakfastCost = includeBreakfast ? 35 * totalGuests * nights : 0;
  const dinnerCost = includeDinner ? 55 * totalGuests * nights : 0;
  const jacuzziCost = includeJacuzziPass ? 50 : 0;
  const skiRentalCost = includeSkiRental ? 40 * adults * nights : 0;
  const grandTotalDirect = directPriceTotal + breakfastCost + dinnerCost + jacuzziCost + skiRentalCost;

  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsValidatingPromo(true);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo({
          code: data.code,
          discountPercentage: data.discountPercentage,
          title: data.title
        });
        setPromoValidationStatus({
          status: 'valid',
          message: data.message || `Kod ${data.code} aktywny! Zniżka -${data.discountPercentage}% naliczona.`
        });
      } else {
        setAppliedPromo(null);
        setPromoValidationStatus({
          status: 'invalid',
          message: data.message || 'Kod rabatowy jest nieprawidłowy, wygasł lub wyczerpał limit użyć.'
        });
      }
    } catch (_) {
      setPromoValidationStatus({
        status: 'invalid',
        message: 'Nie udało się zweryfikować kodu rabatowego.'
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Auto-validate initial promo code if present
  useEffect(() => {
    if (initialQuery?.promoCode && !appliedPromo) {
      setPromoCodeInput(initialQuery.promoCode);
      fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: initialQuery.promoCode })
      })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setAppliedPromo({
            code: data.code,
            discountPercentage: data.discountPercentage,
            title: data.title
          });
          setPromoValidationStatus({
            status: 'valid',
            message: data.message
          });
        }
      })
      .catch(() => {});
    }
  }, [initialQuery?.promoCode]);

  useEffect(() => {
    if (preselectedRoomId && preselectedRoomId !== 'all') {
      setSelectedRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId]);

  // Real-time availability check against existing bookings & Booking.com sync
  useEffect(() => {
    if (!isOpen || !selectedRoomId || !checkIn || !checkOut) return;

    let isCancelled = false;
    setAvailability(prev => ({ ...prev, checking: true, message: 'Sprawdzanie dostępności...' }));

    const timer = setTimeout(() => {
      fetch(`/api/booking/check-availability?roomId=${encodeURIComponent(selectedRoomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`)
        .then(res => res.json())
        .then(data => {
          if (!isCancelled) {
            setAvailability({
              checking: false,
              available: data.available,
              conflict: data.conflict,
              message: data.message,
              syncedWithBookingCom: Boolean(data.syncedWithBookingCom)
            });
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setAvailability({
              checking: false,
              available: true,
              conflict: null,
              message: 'Dostępność zweryfikowana',
              syncedWithBookingCom: true
            });
          }
        });
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedRoomId, checkIn, checkOut, isOpen]);

  if (!isOpen) return null;

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability.available) {
      setErrorMsg('Nie można zrealizować rezerwacji w zajętym terminie. Prosimy wybrać inny termin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/booking/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          checkIn,
          checkOut,
          adults,
          children,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
          paymentMethod,
          includeBreakfast,
          includeDinner,
          addons: [
            ...(includeBreakfast ? [`Śniadanie bufet szwedzki (${breakfastCost} zł)`] : []),
            ...(includeDinner ? [`Obiadokolacja regionalna (${dinnerCost} zł)`] : []),
            ...(includeJacuzziPass ? ['Seans Jacuzzi'] : []),
            ...(includeSkiRental ? ['Wypożyczalnia nart'] : []),
            ...(selectedPackage ? [`Pakiet: ${selectedPackage.title}`] : []),
            ...(appliedPromo ? [`Kod rabatowy: ${appliedPromo.code} (-${appliedPromo.discountPercentage}%)`] : [])
          ],
          promoCode: appliedPromo?.code || (promoCodeInput.trim() ? promoCodeInput.trim().toUpperCase() : undefined),
          totalAmount: grandTotalDirect
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas rezerwacji.');
      }
      setReservationSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Nie udało się zrealizować rezerwacji. Prosimy o kontakt telefoniczny.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="booking-reservation-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="booking-reservation-modal"
        className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 text-[#222222]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#1E3A2B] text-white px-6 py-5 flex items-center justify-between border-b border-[#2A4F3B]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4A373] text-[#14281E] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F8F6]">
                {selectedPackage ? selectedPackage.title : t.bookingModal.modalTitle}
              </h2>
              <p className="text-xs text-[#D4A373]">
                {selectedPackage ? selectedPackage.subtitle : t.bookingModal.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {reservationSuccess ? (
          <div className="p-5 sm:p-8 text-center space-y-6 max-h-[88vh] overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                {t.bookingModal.successTitle}
              </h3>
              <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                {t.bookingModal.reservationNumber} <strong className="text-[#1E3A2B] font-mono text-base">{reservationSuccess.reservationId}</strong>.
                {' '}{t.bookingModal.successSubtitle} (<strong>{guestEmail}</strong>).
              </p>
            </div>

            {/* Bank details summary */}
            <div className="bg-[#F9F8F6] p-6 rounded-2xl border border-neutral-200 text-left max-w-lg mx-auto text-xs space-y-3">
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.bookingModalExtra.bookingComSyncSuccess}</span>
              </div>

              <div className="font-bold text-sm text-[#1E3A2B] pb-2 border-b border-neutral-200">
                {t.bookingModal.depositInstructions}
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.bookingModal.recipient}</span>
                <span className="font-medium text-right">{reservationSuccess.summary.bankDetails.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.bookingModal.bank}</span>
                <span className="font-medium">{reservationSuccess.summary.bankDetails.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.bookingModal.accountNumber}</span>
                <span className="font-mono font-bold text-[#1E3A2B]">{reservationSuccess.summary.bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t.bookingModal.transferTitle}</span>
                <span className="font-medium">{reservationSuccess.summary.bankDetails.title}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm text-[#1E3A2B]">
                <span>{t.bookingModal.totalPrice}</span>
                <span className="text-[#1E3A2B]">{grandTotalDirect} zł</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <button
                onClick={onClose}
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase"
              >
                {t.bookingModal.close}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[88vh] lg:max-h-[82vh] overflow-y-auto">
            {/* Left Column: Dates, Room Selection, Price Breakdown */}
            <div className="lg:col-span-6 p-4 sm:p-6 bg-[#F9F8F6] border-b lg:border-b-0 lg:border-r border-neutral-200 space-y-5">
              {/* Date & Guest inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    {t.bookingBar.checkIn} (od 15:00)
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    {t.bookingBar.checkOut} (do 11:00)
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                  />
                </div>
              </div>

              {/* Real-time Availability & Booking.com Sync Status Indicator */}
              <div className="text-xs">
                {availability.checking ? (
                  <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200/80 px-3 py-2.5 rounded-xl text-amber-800">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                    <span>{t.bookingModal.checkingAvailability}</span>
                  </div>
                ) : !availability.available && availability.conflict ? (
                  <div className="bg-red-50 border-2 border-red-300 text-red-900 p-3 rounded-xl space-y-1 animate-in fade-in">
                    <div className="flex items-center space-x-2 font-bold text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{t.bookingModal.conflictWarning}</span>
                    </div>
                    <p className="text-[11px] text-red-800">
                      {availability.conflict.description}
                    </p>
                    <div className="text-[10px] text-red-700 font-semibold">
                      Zajęty termin: <strong>{availability.conflict.checkIn} do {availability.conflict.checkOut}</strong>.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-900">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-[11px]">{t.bookingModal.available}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-[11px] text-emerald-700">Booking.com Sync</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                      Gwarancja Ceny
                    </span>
                  </div>
                )}
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    {t.bookingBar.guests}
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'osoba' : 'osoby'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    Dzieci (0-12 lat)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 0 ? 'brak' : 'dzieci'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1.5">
                  Wybierz Pokój
                </label>
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'bg-white border-[#D4A373] shadow-sm ring-2 ring-[#D4A373]/30'
                          : 'bg-white/60 hover:bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1E3A2B]">{room.name}</div>
                          <div className="text-[11px] text-neutral-500">
                            Maks. {room.capacity} os. • {room.bedConfig}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#1E3A2B]">
                          {room.basePrice * nights} zł
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {nights} {nights === 1 ? 'noc' : 'noce'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons & Board Selection */}
              <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="text-xs font-bold text-[#1E3A2B] uppercase flex items-center justify-between">
                  <span>{t.bookingModal.addOns}:</span>
                  <span className="text-[10px] text-neutral-500 font-normal">{totalGuests} os. • {nights} {nights === 1 ? 'noc' : 'noce'}</span>
                </div>

                {/* Breakfast Checkbox */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/80 cursor-pointer hover:bg-amber-100/50 transition-colors">
                  <div className="flex items-center space-x-2 text-xs text-neutral-800">
                    <input
                      type="checkbox"
                      checked={includeBreakfast}
                      onChange={(e) => setIncludeBreakfast(e.target.checked)}
                      className="rounded text-[#1E3A2B] focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-[#1E3A2B] flex items-center space-x-1">
                        <Coffee className="w-3.5 h-3.5 text-amber-700 inline" />
                        <span>{t.bookingModal.breakfast}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500">35 zł/os./doba</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {includeBreakfast ? `+${breakfastCost} zł` : '0 zł'}
                  </span>
                </label>

                {/* Dinner Checkbox */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/50 transition-colors">
                  <div className="flex items-center space-x-2 text-xs text-neutral-800">
                    <input
                      type="checkbox"
                      checked={includeDinner}
                      onChange={(e) => setIncludeDinner(e.target.checked)}
                      className="rounded text-[#1E3A2B] focus:ring-0"
                    />
                    <div>
                      <div className="font-semibold text-[#1E3A2B] flex items-center space-x-1">
                        <Utensils className="w-3.5 h-3.5 text-emerald-700 inline" />
                        <span>{t.bookingModal.dinner}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500">55 zł/os./doba</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    {includeDinner ? `+${dinnerCost} zł` : '0 zł'}
                  </span>
                </label>

                <div className="pt-1 border-t border-neutral-100 space-y-1.5">
                  <label className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeJacuzziPass}
                      onChange={(e) => setIncludeJacuzziPass(e.target.checked)}
                      className="rounded text-[#1E3A2B] focus:ring-0"
                    />
                    <span>{t.bookingModal.jacuzziPass} (+50 zł)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSkiRental}
                      onChange={(e) => setIncludeSkiRental(e.target.checked)}
                      className="rounded text-[#1E3A2B] focus:ring-0"
                    />
                    <span>{t.bookingModal.skiRental} (+40 zł/os./doba)</span>
                  </label>
                </div>
              </div>

              {/* Kod Rabatowy Input Box */}
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-800" />
                    <span>{t.bookingModal.promoCodeLabel}</span>
                  </label>
                  {appliedPromo && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      AKTYWNY (-{appliedPromo.discountPercentage}%)
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/\s/g, '');
                      setPromoCodeInput(val);
                      if (appliedPromo && val !== appliedPromo.code) {
                        setAppliedPromo(null);
                        setPromoValidationStatus({ status: 'idle' });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleValidatePromo();
                      }
                    }}
                    placeholder={t.bookingModal.promoCodePlaceholder}
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
                  />
                  <button
                    type="button"
                    onClick={handleValidatePromo}
                    disabled={!promoCodeInput.trim() || isValidatingPromo}
                    className="bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    {isValidatingPromo ? '...' : t.bookingModal.applyPromo}
                  </button>
                </div>

                {/* Feedback message */}
                {promoValidationStatus.status === 'valid' && appliedPromo && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>{appliedPromo.title}:</strong> Naliczono -{appliedPromo.discountPercentage}% rabatu!</span>
                  </div>
                )}
                {promoValidationStatus.status === 'invalid' && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-medium flex items-center space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{promoValidationStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Price Calculation Box */}
              <div className="bg-[#1E3A2B] text-white p-4 rounded-2xl shadow-inner space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Cena standardowa ({nights} noce):</span>
                  <span>{basePriceTotal} zł</span>
                </div>
                <div className="flex justify-between text-[#D4A373] font-bold">
                  <span>
                    {appliedPromo
                      ? `${t.bookingModal.promoDiscount} (${appliedPromo.code} -${appliedPromo.discountPercentage}%):`
                      : `${t.bookingModal.directDiscount}:`}
                  </span>
                  <span>- {savings} zł</span>
                </div>
                {breakfastCost > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>{t.bookingModal.breakfast} ({totalGuests} os. x {nights} nocy):</span>
                    <span>+{breakfastCost} zł</span>
                  </div>
                )}
                {dinnerCost > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>{t.bookingModal.dinner} ({totalGuests} os. x {nights} nocy):</span>
                    <span>+{dinnerCost} zł</span>
                  </div>
                )}
                {jacuzziCost > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>{t.bookingModal.jacuzziPass}:</span>
                    <span>+{jacuzziCost} zł</span>
                  </div>
                )}
                {skiRentalCost > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>{t.bookingModal.skiRental}:</span>
                    <span>+{skiRentalCost} zł</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/15 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-[#F9F8F6]">{t.bookingModal.totalPrice}</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-bold text-[#D4A373]">
                      {grandTotalDirect} zł
                    </span>
                    <div className="text-[10px] text-white/60">
                      {includeBreakfast ? 'zawiera śniadanie' : 'bez śniadania'}
                      {includeDinner ? ' + obiadokolację' : ''} & darmowy parking
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Guest Information & Booking Option Choice */}
            <div className="lg:col-span-6 p-4 sm:p-6 space-y-5 flex flex-col justify-between">
              <form onSubmit={handleSubmitReservation} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-[#1E3A2B] uppercase">
                    {t.bookingModal.guestDetails}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SSL 256-bit</span>
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t.bookingModal.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.bookingModal.fullNamePlaceholder}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {t.bookingModal.email} *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t.bookingModal.emailPlaceholder}
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {t.bookingModal.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.bookingModal.phonePlaceholder}
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {t.bookingModal.specialRequests}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.bookingModal.specialRequestsPlaceholder}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {t.bookingModal.paymentMethod}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                      paymentMethod === 'transfer' ? 'bg-neutral-50 border-[#1E3A2B] font-bold' : 'border-neutral-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                      />
                      <span>{t.bookingModal.bankTransfer}</span>
                    </label>
                    <label className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                      paymentMethod === 'arrival' ? 'bg-neutral-50 border-[#1E3A2B] font-bold' : 'border-neutral-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'arrival'}
                        onChange={() => setPaymentMethod('arrival')}
                      />
                      <span>{t.bookingModal.onArrival}</span>
                    </label>
                  </div>
                </div>

                {/* Primary Direct Booking Submission */}
                <button
                  type="submit"
                  disabled={isSubmitting || !availability.available || availability.checking}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all ${
                    !availability.available
                      ? 'bg-neutral-400 text-white cursor-not-allowed opacity-80'
                      : 'bg-[#1E3A2B] hover:bg-[#2A4F3B] active:scale-[0.99] text-white cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <span>...</span>
                  ) : availability.checking ? (
                    <span>{t.bookingModal.checkingAvailability}</span>
                  ) : !availability.available ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                      <span>{t.bookingModal.conflictWarning}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D4A373]" />
                      <span>{t.bookingModal.confirmBtn}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Official Direct Booking & Booking.com Two-Way Channel Sync Guarantee */}
              <div className="pt-4 border-t border-neutral-200 space-y-2.5">
                <div className="bg-[#1E3A2B]/5 border border-[#1E3A2B]/15 rounded-2xl p-3.5 text-xs text-[#1E3A2B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#1E3A2B]" />
                      <span>Oficjalna Rezerwacja Bezpośrednia Watra</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Sync z Booking.com: Aktywny</span>
                    </span>
                  </div>

                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Wszystkie rezerwacje realizowane są bezpośrednio na naszej stronie. Zintegrowany moduł Channel Managera natychmiast blokuje terminy na portalu Booking.com, wykluczając ryzyko podwójnej rezerwacji (overbooking).
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-700 pt-1 border-t border-[#1E3A2B]/10">
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>10% taniej niż na portalach OTA</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Darmowy monitorowany parking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
