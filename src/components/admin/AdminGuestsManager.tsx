import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  PlusCircle,
  Send,
  MessageSquare,
  Gift,
  Bell,
  Star,
  CheckCircle,
  Tag,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Clock,
  X,
  Archive,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { GuestProfile, GuestMessage } from '../../types';
import { adminFetch } from '../../lib/adminApi';

const PRESET_BADGES = [
  'VIP 👑',
  'Stały Bywalec 🏔️',
  'Klub Narciarza ⛷️',
  'Rodzina 👨‍👩‍👧‍👦',
  'Jacuzzi Lover ♨️',
  'Relaks & Wellness 🌿',
  'Złoty Gość ⭐',
  'Gourmet Karczmy 🍲',
  'Miłośnik Gór 🥾'
];

export const AdminGuestsManager: React.FC = () => {
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Selected guest for interaction
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
  const [guestMessages, setGuestMessages] = useState<GuestMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showArchivedMessages, setShowArchivedMessages] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);

  // Modals
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isNewGuestModalOpen, setIsNewGuestModalOpen] = useState(false);

  // Message Form State
  const [messageType, setMessageType] = useState<'chat' | 'promo' | 'notification'>('promo');
  const [messageText, setMessageText] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(15);
  const [promoCode, setPromoCode] = useState('GOSC-WATRA15');

  // Badge edit state
  const [currentBadges, setCurrentBadges] = useState<string[]>([]);
  const [customBadgeInput, setCustomBadgeInput] = useState('');
  const [currentTier, setCurrentTier] = useState<'bronze' | 'silver' | 'gold' | 'vip'>('bronze');

  // New Guest Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVisits, setNewVisits] = useState(2);
  const [newNotes, setNewNotes] = useState('');
  const [newTier, setNewTier] = useState<'bronze' | 'silver' | 'gold' | 'vip'>('silver');

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/guests');
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
        if (data.length > 0 && !selectedGuest) {
          setSelectedGuest(data[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching guests:', err);
      setError('Nie udało się pobrać listy gości.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuestMessages = async (email: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await adminFetch(`/api/admin/guests/${encodeURIComponent(email)}/messages`);
      if (res.ok) {
        const data = await res.json();
        setGuestMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (selectedGuest) {
      fetchGuestMessages(selectedGuest.email);
      setCurrentBadges(selectedGuest.badges || []);
      setCurrentTier(selectedGuest.loyaltyTier || 'bronze');
    }
  }, [selectedGuest]);

  const openBadgeModal = (guest: GuestProfile) => {
    setSelectedGuest(guest);
    setCurrentBadges(guest.badges || []);
    setCurrentTier(guest.loyaltyTier || 'bronze');
    setIsBadgeModalOpen(true);
  };

  const toggleBadge = (badge: string) => {
    if (currentBadges.includes(badge)) {
      setCurrentBadges(currentBadges.filter(b => b !== badge));
    } else {
      setCurrentBadges([...currentBadges, badge]);
    }
  };

  const addCustomBadge = () => {
    if (!customBadgeInput.trim()) return;
    if (!currentBadges.includes(customBadgeInput.trim())) {
      setCurrentBadges([...currentBadges, customBadgeInput.trim()]);
    }
    setCustomBadgeInput('');
  };

  const saveBadges = async () => {
    if (!selectedGuest) return;
    try {
      const res = await adminFetch(`/api/admin/guests/${selectedGuest.id}/badges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badges: currentBadges,
          loyaltyTier: currentTier
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setGuests(prev => prev.map(g => g.id === selectedGuest.id ? { ...g, badges: currentBadges, loyaltyTier: currentTier } : g));
        setSelectedGuest({ ...selectedGuest, badges: currentBadges, loyaltyTier: currentTier });
        setSuccessNotice(`Zaktualizowano odznaki dla gościa ${selectedGuest.name}`);
        setIsBadgeModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd zapisu odznak.');
    }
  };

  const handleArchiveMessage = async (message: GuestMessage) => {
    if (!selectedGuest || pendingMessageId) return;
    setPendingMessageId(message.id);
    setError(null);
    setSuccessNotice(null);
    try {
      const response = await adminFetch(
        `/api/admin/guests/${encodeURIComponent(selectedGuest.email)}/messages/${encodeURIComponent(message.id)}/archive`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isArchived: !message.isArchived })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Nie udało się zaktualizować archiwum wiadomości.');

      setGuestMessages(current => current.map(item => item.id === message.id ? data.message : item));
      setSuccessNotice(message.isArchived ? 'Przywrócono wiadomość z archiwum.' : 'Zarchiwizowano wiadomość.');
    } catch (err) {
      console.error('Failed to archive guest message:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się zaktualizować archiwum wiadomości.');
    } finally {
      setPendingMessageId(null);
    }
  };

  const handleDeleteMessage = async (message: GuestMessage) => {
    if (!selectedGuest || pendingMessageId) return;
    if (!window.confirm('Czy na pewno chcesz trwale usunąć tę wiadomość? Tej operacji nie można cofnąć.')) return;

    setPendingMessageId(message.id);
    setError(null);
    setSuccessNotice(null);
    try {
      const response = await adminFetch(
        `/api/admin/guests/${encodeURIComponent(selectedGuest.email)}/messages/${encodeURIComponent(message.id)}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Nie udało się usunąć wiadomości.');

      setGuestMessages(current => current.filter(item => item.id !== message.id));
      setSuccessNotice('Wiadomość została trwale usunięta.');
    } catch (err) {
      console.error('Failed to delete guest message:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć wiadomości.');
    } finally {
      setPendingMessageId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest || !messageText.trim()) return;

    try {
      const payload: any = {
        message: messageText.trim(),
        type: messageType
      };

      if (messageType === 'promo') {
        payload.promoDiscount = Number(promoDiscount);
        payload.promoCode = promoCode.trim().toUpperCase();
      }

      const res = await adminFetch(`/api/admin/guests/${encodeURIComponent(selectedGuest.email)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setGuestMessages(prev => [...prev, data.message]);
        setMessageText('');
        setSuccessNotice(`Wysłano ${messageType === 'promo' ? 'promocję z kodem rabatowym' : 'wiadomość'} do ${selectedGuest.name}!`);
        setIsMessageModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Błąd wysyłania wiadomości.');
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        totalVisits: Number(newVisits),
        notes: newNotes.trim(),
        loyaltyTier: newTier,
        badges: ['Stały Bywalec 🏔️']
      };

      const res = await adminFetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessNotice(`Pomyślnie dodano stałego gościa: ${newName}`);
        setIsNewGuestModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewNotes('');
        await fetchGuests();
      }
    } catch (err: any) {
      setError(err.message || 'Błąd tworzenia profilu gościa.');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'gold': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'silver': return 'bg-slate-100 text-slate-800 border-slate-300';
      default: return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">Stali Goście, Odznaki i Komunikacja</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-900 rounded-full">
              System Lojalnościowy Watra
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Nadawaj unikalne odznaki częstym gościom, wysyłaj dedykowane powiadomienia z rabatami oraz prowadź bezpośredni czat wewnętrzny.
          </p>
        </div>
        <button
          onClick={() => setIsNewGuestModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-sm font-medium rounded-xl shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Dodaj Stałego Gościa
        </button>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Main split view: Guest List (Left) + Guest Communication & Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guest List Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 px-1">
            Lista Częstych Gości ({guests.length})
          </h3>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {guests.map((g) => {
              const isSelected = selectedGuest?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuest(g)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-800/40 shadow-sm ring-1 ring-amber-800/20'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-base">{g.name}</span>
                        <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getTierColor(g.loyaltyTier)}`}>
                          {g.loyaltyTier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{g.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-stone-100 text-stone-700 rounded-lg">
                      {g.totalVisits} {g.totalVisits === 1 ? 'pobyt' : g.totalVisits < 5 ? 'pobyty' : 'pobytów'}
                    </span>
                  </div>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {g.badges && g.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white text-stone-800 text-xs font-medium rounded-md border border-stone-200 shadow-2xs"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {g.notes && (
                    <p className="text-xs text-stone-500 italic mt-2.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      „{g.notes}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Guest Details & Communication Column */}
        <div className="lg:col-span-7">
          {selectedGuest ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              {/* Header card with actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-stone-900">{selectedGuest.name}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${getTierColor(selectedGuest.loyaltyTier)}`}>
                      Tier {selectedGuest.loyaltyTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-stone-600 mt-2">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" /> {selectedGuest.email}</span>
                    {selectedGuest.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" /> {selectedGuest.phone}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-stone-400" /> Łącznie {selectedGuest.totalVisits} wizyt w resorcie</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openBadgeModal(selectedGuest)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-800" />
                    Zarządzaj Odznakami
                  </button>
                  <button
                    onClick={() => {
                      setMessageType('promo');
                      setIsMessageModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    Wyślij Rabat / Czat
                  </button>
                </div>
              </div>

              {/* Active Badges Panel */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Aktualne Odznaki Gościa ({selectedGuest.badges?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGuest.badges && selectedGuest.badges.length > 0 ? (
                    selectedGuest.badges.map((b, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 text-sm font-semibold rounded-xl border border-amber-200 shadow-2xs flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400 italic">Brak przypisanych odznak. Kliknij „Zarządzaj Odznakami”, aby dodać.</span>
                  )}
                </div>
              </div>

              {/* Communication / Message History Thread */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-stone-400" />
                    Wątek Komunikacji i Promocji z Gościem
                  </h4>
                  <button
                    onClick={() => {
                      setMessageType('chat');
                      setIsMessageModalOpen(true);
                    }}
                    className="text-xs font-medium text-amber-800 hover:text-amber-900 hover:underline"
                  >
                    + Nowa wiadomość
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowArchivedMessages(false)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      !showArchivedMessages ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Wiadomości ({guestMessages.filter(message => !message.isArchived).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArchivedMessages(true)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      showArchivedMessages ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Archiwum ({guestMessages.filter(message => message.isArchived).length})
                  </button>
                </div>

                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 min-h-[220px] max-h-[340px] overflow-y-auto space-y-3">
                  {isLoadingMessages ? (
                    <div className="text-center py-8 text-xs text-stone-400">Ładowanie wiadomości...</div>
                  ) : guestMessages.filter(message => message.isArchived === showArchivedMessages).length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Bell className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs text-stone-500">
                        {showArchivedMessages ? 'Archiwum jest puste.' : 'Brak historii wiadomości z tym gościem.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMessageType('promo');
                          setIsMessageModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-800 text-white text-xs font-semibold rounded-lg hover:bg-amber-900"
                      >
                        Wyślij pierwszą wiadomość lub kod rabatowy
                      </button>
                    </div>
                  ) : (
                    guestMessages.filter(message => message.isArchived === showArchivedMessages).map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-xl text-xs space-y-1.5 border shadow-2xs ${
                          msg.type === 'promo'
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : msg.type === 'notification'
                            ? 'bg-blue-50 border-blue-200 text-blue-950'
                            : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] font-medium text-stone-500">
                          <span className="flex items-center gap-1 font-bold text-stone-700">
                            {msg.type === 'promo' ? '🎁 Oferta Rabatowa' : msg.type === 'notification' ? '🔔 Powiadomienie' : msg.type === 'inquiry' ? '✉️ Formularz kontaktowy' : '💬 Czat recepcji'}
                            {' • '} {msg.senderName}
                            {msg.isArchived && <span className="ml-1 rounded bg-stone-200 px-1.5 py-0.5 text-[10px]">Archiwum</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>{new Date(msg.createdAt).toLocaleString('pl-PL')}</span>
                            <button
                              type="button"
                              onClick={() => void handleArchiveMessage(msg)}
                              disabled={pendingMessageId !== null}
                              aria-label={msg.isArchived ? 'Przywróć wiadomość z archiwum' : 'Zarchiwizuj wiadomość'}
                              title={msg.isArchived ? 'Przywróć z archiwum' : 'Archiwizuj'}
                              className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-[10px] font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                            >
                              {msg.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                              {msg.isArchived ? 'Przywróć' : 'Archiwizuj'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteMessage(msg)}
                              disabled={pendingMessageId !== null}
                              aria-label="Usuń wiadomość"
                              title="Usuń wiadomość trwale"
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Usuń
                            </button>
                          </div>
                        </div>

                        <p className="text-sm font-normal leading-relaxed">{msg.message}</p>

                        {msg.promoCode && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono font-bold text-xs rounded">
                              KOD: {msg.promoCode} (-{msg.promoDiscount}%)
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Quick message bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!messageText.trim()) return;
                    setMessageType('chat');
                    handleSendMessage(e);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Napisz wiadomość na czacie do ${selectedGuest.name}...`}
                    className="flex-1 px-4 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Wyślij
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
              Wybierz gościa z listy po lewej stronie, aby zarządzać odznakami i wiadomościami.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Zarządzanie Odznakami */}
      {isBadgeModalOpen && selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900">
                Odznaki dla: {selectedGuest.name}
              </h3>
              <button onClick={() => setIsBadgeModalOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">
                ✕
              </button>
            </div>

            {/* Loyalty Tier Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Poziom Lojalnościowy (Tier)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['bronze', 'silver', 'gold', 'vip'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setCurrentTier(tier)}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                      currentTier === tier
                        ? 'bg-amber-800 text-white border-amber-800 shadow'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Badges */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Wybierz Odznaki z Szablonu:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_BADGES.map((badge) => {
                  const isSelected = currentBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {badge}
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Badge Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Lub wpisz własną odznakę:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBadgeInput}
                  onChange={(e) => setCustomBadgeInput(e.target.value)}
                  placeholder="np. Instruktor PZN 🎿 lub Honorowy Gość 🥇"
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={addCustomBadge}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl"
                >
                  Dodaj
                </button>
              </div>
            </div>

            {/* Current selection preview */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                Wybrane odznaki do zapisu ({currentBadges.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentBadges.map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white text-stone-800 text-xs font-medium rounded-lg border border-stone-200 flex items-center gap-1"
                  >
                    {b}
                    <button onClick={() => toggleBadge(b)} className="text-stone-400 hover:text-rose-600 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsBadgeModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={saveBadges}
                className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow"
              >
                Zapisz Odznaki
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Wyślij Wiadomość / Rabat */}
      {isMessageModalOpen && selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900">
                Wyślij Wiadomość / Rabat do: {selectedGuest.name}
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">
                ✕
              </button>
            </div>

            {/* Type tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMessageType('promo')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                  messageType === 'promo'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                Promocja & Rabat
              </button>
              <button
                type="button"
                onClick={() => setMessageType('notification')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                  messageType === 'notification'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                Powiadomienie
              </button>
              <button
                type="button"
                onClick={() => setMessageType('chat')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                  messageType === 'chat'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Czat Wewnętrzny
              </button>
            </div>

            {/* Promo fields */}
            {messageType === 'promo' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                    Wysokość Rabatu (%)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-amber-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                    Indywidualny Kod
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg uppercase"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Treść Wiadomości:
              </label>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  messageType === 'promo'
                    ? `Dzień dobry! Z okazji kolejnego pobytu przygotowaliśmy dla Państwa specjalny rabat ${promoDiscount}% na najbliższy weekend w Watra Korbielów...`
                    : 'Napisz treść wiadomości do gościa...'
                }
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsMessageModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow"
              >
                Wyślij do Gościa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dodaj Nowego Stałego Gościa */}
      {isNewGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900">
                Dodaj Nowego Stałego Gościa
              </h3>
              <button onClick={() => setIsNewGuestModalOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Imię i Nazwisko *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="jan.kowalski@example.com"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+48 600 123 456"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Liczba Pobytów</label>
                  <input
                    type="number"
                    min={1}
                    value={newVisits}
                    onChange={(e) => setNewVisits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tier Lojalnościowy</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Notatki / Preferencje</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="np. Preferuje pokój na poddaszu, jeździ na nartach z córką..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewGuestModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow"
                >
                  Utwórz Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
