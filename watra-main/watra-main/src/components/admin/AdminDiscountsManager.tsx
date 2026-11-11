import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Bot,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  Sparkles,
  Percent,
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { DiscountCode, DiscountTerminationType, DiscountValidationResult } from '../../types';
import { adminFetch } from '../../lib/adminApi';

interface ExtendedDiscountCode extends DiscountCode {
  isValidCurrently?: boolean;
  validityReason?: string | null;
}

export const AdminDiscountsManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<ExtendedDiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'chat' | 'expired' | 'limit_reached'>('all');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscount, setFormDiscount] = useState<number>(15);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formTerminationType, setFormTerminationType] = useState<DiscountTerminationType>('both');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('2027-03-31');
  const [formUsageLimit, setFormUsageLimit] = useState<string>('50');
  const [formAvailableInChat, setFormAvailableInChat] = useState<boolean>(true);
  const [formChatTriggerNote, setFormChatTriggerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time test checker
  const [testInputCode, setTestInputCode] = useState('');
  const [testResult, setTestResult] = useState<DiscountValidationResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminFetch('/api/admin/discounts');
      if (res.status === 401 || res.status === 403) {
        setErrorMsg('Sesja administratora wygasła. Zaloguj się ponownie.');
        return;
      }
      if (!res.ok) throw new Error('Błąd ładowania kodów rabatowych.');
      const data = await res.json();
      setDiscounts(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Nie udało się pobrać danych.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormCode('');
    setFormTitle('');
    setFormDescription('');
    setFormDiscount(15);
    setFormActive(true);
    setFormTerminationType('both');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2027-03-31');
    setFormUsageLimit('50');
    setFormAvailableInChat(true);
    setFormChatTriggerNote('Dla gości pytających w czacie o rabat lub tańszą rezerwację.');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExtendedDiscountCode) => {
    setEditingId(item.id);
    setFormCode(item.code);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormDiscount(item.discountPercentage);
    setFormActive(item.active);
    setFormTerminationType(item.terminationType);
    setFormStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(item.endDate || '2027-03-31');
    setFormUsageLimit(item.usageLimit !== null && item.usageLimit !== undefined ? String(item.usageLimit) : '');
    setFormAvailableInChat(item.availableInChat);
    setFormChatTriggerNote(item.chatTriggerNote || '');
    setIsModalOpen(true);
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      alert('Wprowadź kod rabatowy.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      code: formCode.trim().toUpperCase(),
      title: formTitle.trim() || `Promocja ${formCode.trim().toUpperCase()}`,
      description: formDescription.trim(),
      discountPercentage: Number(formDiscount) || 10,
      active: formActive,
      terminationType: formTerminationType,
      startDate: formStartDate,
      endDate: formEndDate,
      usageLimit: formUsageLimit ? Number(formUsageLimit) : null,
      availableInChat: formAvailableInChat,
      chatTriggerNote: formChatTriggerNote.trim()
    };

    try {
      if (editingId) {
        // Update
        const res = await adminFetch(`/api/admin/discounts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd aktualizacji kodu.');
        showNotification(`Zaktualizowano kod ${payload.code}`);
      } else {
        // Create
        const res = await adminFetch('/api/admin/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd tworzenia kodu.');
        showNotification(`Pomyślnie dodano kod rabatowy ${payload.code}`);
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (err: any) {
      alert(err.message || 'Wystąpił błąd.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: ExtendedDiscountCode) => {
    try {
      const res = await adminFetch(`/api/admin/discounts/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active })
      });
      if (res.ok) {
        showNotification(`Kod ${item.code} został ${!item.active ? 'aktywowany' : 'wstrzymany'}`);
        fetchDiscounts();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Nie udało się zmienić statusu kodu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Błąd sieci podczas zmiany statusu.');
    }
  };

  const handleToggleChat = async (item: ExtendedDiscountCode) => {
    try {
      const res = await adminFetch(`/api/admin/discounts/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableInChat: !item.availableInChat })
      });
      if (res.ok) {
        showNotification(`Zaktualizowano dostępność kodu ${item.code} w Concierge AI`);
        fetchDiscounts();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Nie udało się zmienić widoczności w AI.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Błąd sieci podczas zmiany widoczności w AI.');
    }
  };

  const handleResetCounter = async (item: ExtendedDiscountCode) => {
    if (!window.confirm(`Czy na pewno zresetować licznik wykorzystań kodu "${item.code}" do zera?`)) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/discounts/${item.id}/reset-counter`, {
        method: 'POST'
      });
      if (res.ok) {
        showNotification(`Licznik kodu ${item.code} zresetowany do 0`);
        fetchDiscounts();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Nie udało się zresetować licznika.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Błąd sieci podczas resetowania licznika.');
    }
  };

  const handleDelete = async (item: ExtendedDiscountCode) => {
    if (!window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć kod "${item.code}"?`)) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/discounts/${item.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification(`Kod ${item.code} został usunięty.`);
        fetchDiscounts();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Nie udało się usunąć kodu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Błąd sieci podczas usuwania.');
    }
  };

  const handleTestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInputCode.trim()) return;
    setIsTesting(true);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testInputCode.trim() })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (_) {
      setTestResult({
        valid: false,
        message: 'Błąd połączenia z serwerem weryfikacji.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // KPIs
  const totalCodes = discounts.length;
  const activeCodes = discounts.filter(d => d.active && d.isValidCurrently).length;
  const chatCodes = discounts.filter(d => d.availableInChat && d.active && d.isValidCurrently).length;
  const totalRedemptions = discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0);

  // Filtered list
  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch =
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'active') return d.active && d.isValidCurrently;
    if (filterTab === 'chat') return d.availableInChat;
    if (filterTab === 'expired') {
      const todayStr = new Date().toISOString().split('T')[0];
      return Boolean(d.endDate && todayStr > d.endDate);
    }
    if (filterTab === 'limit_reached') {
      return d.usageLimit != null && d.usedCount >= d.usageLimit;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Percent className="w-3.5 h-3.5" />
            <span>Centrum Promocji & Kodów Rabatowych</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
            Zarządzanie Kodami Rabatowymi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Twórz, edytuj i kontroluj kody rabatowe. Definiuj ważność według dat (okres czasowy) lub limitu sprzedaży (liczba rezerwacji). Wszystkie kody są natychmiast synchronizowane z asystentem Concierge AI i koszykiem rezerwacji.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDiscounts}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
            title="Odśwież"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-[#D4A373]" />
            <span>Nowy Kod Rabatowy</span>
          </button>
        </div>
      </div>

      {/* Success / Error notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Wszystkie Kody</span>
            <Tag className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1E3A2B]">{totalCodes}</div>
          <div className="text-[11px] text-neutral-400">skonfigurowanych w systemie</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Aktywne Kody</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">{activeCodes}</div>
          <div className="text-[11px] text-neutral-400">gotowych do natychmiastowego użycia</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-semibold uppercase tracking-wider">W Czacie Concierge AI</span>
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-indigo-700">{chatCodes}</div>
          <div className="text-[11px] text-neutral-400">udostępnionych asystentowi AI</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Wykorzystane Kody</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-800">{totalRedemptions}</div>
          <div className="text-[11px] text-neutral-400">zrealizowanych rezerwacji</div>
        </div>
      </div>

      {/* Real-time Code Tester Widget */}
      <div className="bg-gradient-to-r from-[#14281E] to-[#1E3A2B] text-white p-6 rounded-3xl shadow-lg border border-[#2A4F3B]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D4A373]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tester Kodów Rabatowych w Czasie Rzeczywistym</span>
            </div>
            <p className="text-xs text-neutral-300">
              Sprawdź natychmiast, jak system (oraz Concierge AI) zinterpretuje wprowadzony kod rabatowy.
            </p>
          </div>

          <form onSubmit={handleTestCode} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              value={testInputCode}
              onChange={(e) => setTestInputCode(e.target.value.toUpperCase())}
              placeholder="Wpisz np. BESKID20"
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4A373] w-full md:w-56 font-mono tracking-wider font-bold"
            />
            <button
              type="submit"
              disabled={isTesting}
              className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              {isTesting ? 'Badanie...' : 'Weryfikuj'}
            </button>
          </form>
        </div>

        {testResult && (
          <div className={`mt-4 p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            testResult.valid
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
            {testResult.valid && (
              <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-300">
                -{testResult.discountPercentage}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-2xs overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#1E3A2B] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Wszystkie ({totalCodes})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'active'
                ? 'bg-[#1E3A2B] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Aktywne ({activeCodes})
          </button>
          <button
            onClick={() => setFilterTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'chat'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            🤖 W Czacie Concierge ({chatCodes})
          </button>
          <button
            onClick={() => setFilterTab('expired')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'expired'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Wygasłe Czasowo
          </button>
          <button
            onClick={() => setFilterTab('limit_reached')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === 'limit_reached'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Wyczerpany Limit
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj kodu lub nazwy..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-2xl border border-neutral-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
          />
        </div>
      </div>

      {/* Discounts List Cards */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12 text-sm text-neutral-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4A373]" />
            Ładowanie kodów rabatowych...
          </div>
        )}

        {!isLoading && filteredDiscounts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs space-y-3">
            <Tag className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-neutral-800">Brak kodów rabatowych</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Nie znaleziono żadnych kodów rabatowych dla wybranych kryteriów. Kliknij przycisk poniżej, aby utworzyć nową promocję.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-[#1E3A2B] text-white px-5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer"
            >
              Dodaj Pierwszy Kod
            </button>
          </div>
        )}

        {filteredDiscounts.map((item) => {
          const isLimitType = item.terminationType === 'usage_limit' || item.terminationType === 'both';
          const isTimeType = item.terminationType === 'time' || item.terminationType === 'both';
          const isInfinite = item.terminationType === 'none';

          const usagePercentage = (item.usageLimit && item.usageLimit > 0)
            ? Math.min(100, Math.round((item.usedCount / item.usageLimit) * 100))
            : 0;

          const isLimitReached = isLimitType && item.usageLimit != null && item.usedCount >= item.usageLimit;
          const todayStr = new Date().toISOString().split('T')[0];
          const isTimeExpired = isTimeType && item.endDate && todayStr > item.endDate;
          const isTimeUpcoming = isTimeType && item.startDate && todayStr < item.startDate;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border transition-all hover:shadow-md ${
                !item.active
                  ? 'border-neutral-200/60 opacity-75 bg-neutral-50/50'
                  : isLimitReached || isTimeExpired
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-neutral-200/90 shadow-2xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Block: Code, Title, Tags */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    {/* Big Code Pill */}
                    <div className="flex items-center space-x-1.5 bg-neutral-900 text-white font-mono text-sm sm:text-base font-bold px-3.5 py-1.5 rounded-xl shadow-xs tracking-wider">
                      <span>{item.code}</span>
                      <button
                        onClick={() => handleCopy(item.code)}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                        title="Kopiuj kod"
                      >
                        {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Discount Badge */}
                    <span className="font-serif text-sm font-bold bg-[#D4A373]/20 text-[#1E3A2B] px-3 py-1 rounded-xl border border-[#D4A373]/30">
                      -{item.discountPercentage}% Rabatu
                    </span>

                    {/* Active/Inactive Badge */}
                    {item.active ? (
                      isTimeExpired ? (
                        <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg border border-rose-200 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Wygasł termin</span>
                        </span>
                      ) : isLimitReached ? (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>Limit wyczerpany</span>
                        </span>
                      ) : isTimeUpcoming ? (
                        <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Od {item.startDate}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktywny</span>
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-bold bg-neutral-200 text-neutral-600 px-2.5 py-0.5 rounded-lg border border-neutral-300 flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Wstrzymany</span>
                      </span>
                    )}

                    {/* Concierge AI Badge */}
                    <button
                      onClick={() => handleToggleChat(item)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center space-x-1 cursor-pointer transition-all ${
                        item.availableInChat
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                      }`}
                      title="Kliknij, aby zmienić dostępność w asystencie AI"
                    >
                      <Bot className="w-3 h-3" />
                      <span>{item.availableInChat ? '🤖 W Czacie AI' : 'Ukryty w czacie'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {item.chatTriggerNote && item.availableInChat && (
                    <div className="bg-indigo-50/70 p-2 rounded-xl text-[11px] text-indigo-900 border border-indigo-100 flex items-start space-x-2">
                      <Bot className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Instrukcja dla Concierge AI:</strong> {item.chatTriggerNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Block: Validity rules & sales count */}
                <div className="w-full lg:w-72 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Warunki ważności</span>
                    <span className="text-neutral-700 font-mono text-[10px]">
                      {item.terminationType === 'both' ? 'Czas + Liczba' : item.terminationType === 'usage_limit' ? 'Liczba sprzedaży' : item.terminationType === 'time' ? 'Okres czasu' : 'Bezterminowy'}
                    </span>
                  </div>

                  {/* Dates if time limited */}
                  {isTimeType && (
                    <div className="flex items-center space-x-2 text-xs text-neutral-700">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>
                        {item.startDate ? item.startDate : 'Brak'} &rarr; <strong>{item.endDate ? item.endDate : 'Brak'}</strong>
                      </span>
                    </div>
                  )}

                  {isInfinite && (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bezterminowy (zawsze ważny)</span>
                    </div>
                  )}

                  {/* Usage Counter / Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">Sprzedane / użyte:</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {item.usedCount}
                        {item.usageLimit != null ? ` / ${item.usageLimit}` : ' razy'}
                      </span>
                    </div>

                    {item.usageLimit != null && (
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercentage >= 100
                              ? 'bg-rose-500'
                              : usagePercentage >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Block: Action Buttons */}
                <div className="flex lg:flex-col items-center justify-end space-x-2 lg:space-x-0 lg:space-y-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center justify-center space-x-1.5 ${
                      item.active
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                    }`}
                  >
                    <span>{item.active ? 'Wstrzymaj' : 'Aktywuj'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="w-full px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edytuj</span>
                  </button>

                  <button
                    onClick={() => handleResetCounter(item)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                    title="Resetuj licznik użyć do zera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Usuń kod rabatowy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create / Edit Discount Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E3A2B]">
                  {editingId ? 'Edycja Kodu Rabatowego' : 'Nowy Kod Rabatowy'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Określ nazwę, wielkość zniżki oraz zasady zakończenia promocji.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Kod rabatowy *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="np. FERIE2026"
                    className="w-full px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
                  />
                  <span className="text-[10px] text-neutral-400">Tylko wielkie litery, cyfry i myślniki</span>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Wielkość rabatu (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="90"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-bold">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Standard to 10% – 20%</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Tytuł promocji *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="np. Rabat First Minute Ferie Zimowe"
                  className="w-full px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Opis warunków / pakietu
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="np. Zniżka obowiązuje na rezerwacje pobytów od 3 nocy ze śniadaniami."
                  className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A2B]"
                />
              </div>

              {/* Termination Type Selector */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Sposób zakończenia / ważność kodu *
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormTerminationType('both')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      formTerminationType === 'both'
                        ? 'bg-[#1E3A2B] text-white border-[#1E3A2B]'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold">Czas + Liczba</div>
                    <div className="text-[10px] opacity-80">Do daty LUB limitu sztuk</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTerminationType('time')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      formTerminationType === 'time'
                        ? 'bg-[#1E3A2B] text-white border-[#1E3A2B]'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold">Tylko Czas</div>
                    <div className="text-[10px] opacity-80">Ważny do określonej daty</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTerminationType('usage_limit')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      formTerminationType === 'usage_limit'
                        ? 'bg-[#1E3A2B] text-white border-[#1E3A2B]'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold">Liczba Sprzedaży</div>
                    <div className="text-[10px] opacity-80">Np. pierwsze 30 rezerwacji</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTerminationType('none')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      formTerminationType === 'none'
                        ? 'bg-[#1E3A2B] text-white border-[#1E3A2B]'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold">Bezterminowy</div>
                    <div className="text-[10px] opacity-80">Zawsze aktywny</div>
                  </button>
                </div>

                {/* Conditional Fields based on termination type */}
                {(formTerminationType === 'time' || formTerminationType === 'both') && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Ważny od (data)
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:ring-1 focus:ring-[#1E3A2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Ważny do (data zakończenia) *
                      </label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:ring-1 focus:ring-[#1E3A2B]"
                      />
                    </div>
                  </div>
                )}

                {(formTerminationType === 'usage_limit' || formTerminationType === 'both') && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Maksymalna liczba rezerwacji z tym kodem (limit sprzedaży) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(e.target.value)}
                      placeholder="np. 30"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs font-mono font-bold focus:ring-1 focus:ring-[#1E3A2B]"
                    />
                    <span className="text-[10px] text-neutral-400">
                      Gdy goście wykorzystają tę liczbę kodów, promocja natychmiast wygaśnie.
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Concierge Settings */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAvailableInChat}
                    onChange={(e) => setFormAvailableInChat(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Udostępnij kod w czacie Concierge AI</span>
                    </div>
                    <div className="text-indigo-700/80 text-[11px]">
                      Asystent AI będzie mógł proponować ten kod gościom pytającym o rabat lub zniżkę.
                    </div>
                  </div>
                </label>

                {formAvailableInChat && (
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                      Wskazówka / instrukcja dla asystenta AI:
                    </label>
                    <input
                      type="text"
                      value={formChatTriggerNote}
                      onChange={(e) => setFormChatTriggerNote(e.target.value)}
                      placeholder="np. Dla gości pytających o pobyty w tygodniu lub narty"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300"
                />
                <span className="text-xs font-bold text-neutral-800">
                  Kod natychmiast aktywny
                </span>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Zapisywanie...' : editingId ? 'Zapisz Zmiany' : 'Utwórz Kod Rabatowy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDiscountsManager;
