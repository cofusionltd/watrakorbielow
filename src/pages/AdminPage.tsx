import { CmsManagedImage } from '../components/CmsManagedImage';
import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  PlusCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Tag,
  Percent,
  Sparkles,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  Users,
  Bed,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Bot,
  BookOpen,
  Send,
  Layers,
  Power,
  FileUp,
  Check,
  CheckSquare,
  HelpCircle,
  Info,
  Sliders,
  Activity,
  LogOut,
  Inbox
} from 'lucide-react';
import { PromotionalCampaign, AiKnowledgeDoc } from '../types';
import { AdminAnalyticsDashboard } from '../components/AdminAnalyticsDashboard';
import { AdminRoomsManager } from '../components/admin/AdminRoomsManager';
import { AdminGuestsManager } from '../components/admin/AdminGuestsManager';
import { AdminInquiriesManager } from '../components/admin/AdminInquiriesManager';
import { AdminLiveChatManager } from '../components/admin/AdminLiveChatManager';
import { AdminCmsManager } from '../components/admin/AdminCmsManager';
import { AdminDiscountsManager } from '../components/admin/AdminDiscountsManager';
import { AdminSiteControls } from '../components/admin/AdminSiteControls';
import { adminFetch, getAdminToken, setAdminToken, clearAdminToken } from '../lib/adminApi';
import { Language } from '../types';
import { adminText } from '../adminTranslations';

const MAX_CAMPAIGN_IMAGE_SIZE = 35 * 1024 * 1024;
const CAMPAIGN_IMAGE_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);

export const AdminPage: React.FC<{ lang: Language }> = ({ lang }) => {
  // Server-authenticated admin session check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getAdminToken();
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'cms' | 'controls' | 'discounts' | 'analytics' | 'rooms' | 'live-chat' | 'guests' | 'inquiries' | 'campaigns' | 'reservations' | 'knowledge'>('cms');

  // Campaigns state
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [campaignFormError, setCampaignFormError] = useState<string | null>(null);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Knowledge Base state
  const [knowledgeDocs, setKnowledgeDocs] = useState<AiKnowledgeDoc[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'hotel' | 'slopes' | 'restaurant' | 'spa' | 'area' | 'other'>('hotel');
  const [docContent, setDocContent] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [selectedDocCategoryFilter, setSelectedDocCategoryFilter] = useState<string>('all');
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Live AI Knowledge Tester
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // New Campaign Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDiscount, setFormDiscount] = useState<number>(15);
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/images/image-13.jpg');

  const resetCampaignForm = () => {
    setEditingCampaignId(null);
    setFormTitle('');
    setFormDiscount(15);
    setFormPrice('');
    setFormImageUrl('/images/image-13.jpg');
    setCampaignFormError(null);
    setImageUploadNotice(null);
  };

  const startCampaignEdit = (campaign: PromotionalCampaign) => {
    setEditingCampaignId(campaign.id);
    setFormTitle(campaign.title);
    setFormDiscount(campaign.discountPercentage);
    setFormPrice(campaign.price);
    setFormImageUrl(campaign.imageUrl);
    setCampaignFormError(null);
    setImageUploadNotice(null);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const res = await adminFetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Fetch reservations
  const fetchReservations = async () => {
    setIsLoadingReservations(true);
    try {
      const res = await adminFetch('/api/admin/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Fetch AI Knowledge Docs
  const fetchKnowledgeDocs = async () => {
    setIsLoadingKnowledge(true);
    try {
      const res = await adminFetch('/api/admin/knowledge-base');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeDocs(data);
      }
    } catch (err) {
      console.error('Error fetching knowledge docs:', err);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  useEffect(() => {
    const handleAdminSessionExpired = () => {
      clearAdminToken();
      setIsAuthenticated(false);
      setAuthError('Sesja administratora wygasła. Zaloguj się ponownie.');
    };

    window.addEventListener('watra-admin-session-expired', handleAdminSessionExpired);

    return () => {
      window.removeEventListener('watra-admin-session-expired', handleAdminSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
      fetchReservations();
      fetchKnowledgeDocs();
    }
  }, [isAuthenticated]);

  // Image upload handler for campaigns
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setCampaignFormError(null);
    setImageUploadNotice(null);
    try {
      if (!CAMPAIGN_IMAGE_TYPES.has(file.type)) {
        throw new Error('Obsługiwane formaty zdjęć to AVIF, GIF, JPG, PNG, SVG i WebP.');
      }
      if (file.size === 0 || file.size > MAX_CAMPAIGN_IMAGE_SIZE) {
        throw new Error('Plik jest pusty albo przekracza limit 35 MB.');
      }

      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Nie udało się odczytać obrazu.'));
        reader.onerror = () => reject(new Error('Nie udało się odczytać obrazu.'));
        reader.readAsDataURL(file);
      });
      const response = await adminFetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, fileName: file.name }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się przesłać zdjęcia.');
      }
      if (typeof result.url !== 'string' || !result.url.startsWith('/images/')) {
        throw new Error('Serwer zwrócił nieprawidłowy adres zdjęcia.');
      }

      setFormImageUrl(result.url);
      setImageUploadNotice(`Zdjęcie "${file.name}" wgrano i wybrano pomyślnie.`);
    } catch (error) {
      console.error('Campaign image upload failed:', error);
      setCampaignFormError(error instanceof Error ? error.message : 'Błąd sieci podczas wgrywania zdjęcia.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // AI Knowledge File reader handler (.txt, .md, .doc, .csv, .json)
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFileName(file.name);
    if (!docTitle) {
      const cleanedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocContent(text);
        setActionSuccess(`Plik "${file.name}" odczytany (${Math.round(text.length)} znaków).`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Create Knowledge Document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      const res = await adminFetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          category: docCategory,
          content: docContent,
          fileName: docFileName || `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`
        })
      });

      if (res.ok) {
        setActionSuccess(`Dokument "${docTitle}" dodany do bazy wiedzy AI! Asystent już z niego korzysta.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setDocTitle('');
        setDocContent('');
        setDocFileName('');
        setIsCreatingDoc(false);
        fetchKnowledgeDocs();
      }
    } catch (err) {
      console.error('Error creating knowledge doc:', err);
    }
  };

  // Toggle Knowledge Document active state
  const handleToggleDoc = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/knowledge-base/${id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchKnowledgeDocs();
      }
    } catch (err) {
      console.error('Error toggling doc:', err);
    }
  };

  // Delete Knowledge Document
  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Czy na pewno usunąć dokument "${title}" z bazy wiedzy AI?`)) return;
    try {
      const res = await adminFetch(`/api/admin/knowledge-base/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActionSuccess(`Dokument "${title}" usunięty z bazy wiedzy AI.`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchKnowledgeDocs();
      }
    } catch (err) {
      console.error('Error deleting doc:', err);
    }
  };

  // Test live AI Knowledge prompt
  const handleTestAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim() || isTestingAi) return;

    setIsTestingAi(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt,
          preferredLang: 'pl'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResponse(data.reply);
      } else {
        setTestResponse('Błąd podczas generowania odpowiedzi AI.');
      }
    } catch (err) {
      setTestResponse('Brak połączenia z silnikiem AI.');
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        setPasscode('');
      } else {
        setAuthError(data.error || 'Nieprawidłowe hasło administratora.');
      }
    } catch (_) {
      setAuthError('Błąd połączenia z serwerem autoryzacji.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setPasscode('');
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignFormError(null);

    setIsSavingCampaign(true);
    try {
      const res = await adminFetch(
        editingCampaignId
          ? `/api/admin/campaigns/${encodeURIComponent(editingCampaignId)}`
          : '/api/admin/campaigns',
        {
        method: editingCampaignId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          discountPercentage: formDiscount,
          price: formPrice.trim(),
          imageUrl: formImageUrl,
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Nie udało się zapisać kampanii.');
      }

      if (res.ok) {
        setActionSuccess(editingCampaignId
          ? `Kampania "${formTitle}" została zaktualizowana.`
          : `Kampania "${formTitle}" została pomyślnie opublikowana!`);
        setIsCreating(false);
        resetCampaignForm();
        fetchCampaigns();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
      setCampaignFormError(err instanceof Error ? err.message : 'Nie udało się zapisać kampanii.');
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await adminFetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (res.ok) {
        fetchCampaigns();
        setActionSuccess('Status publikacji kampanii został zaktualizowany.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error toggling campaign:', err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę kampanię promocyjną?')) return;
    try {
      const res = await adminFetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCampaigns();
        setActionSuccess('Kampania została usunięta.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: string) => {
    try {
      const res = await adminFetch(`/api/admin/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchReservations();
        setActionSuccess(`Zaktualizowano status rezerwacji ${id}`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F9F8F6]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-neutral-200 text-center space-y-6">
          <div className="w-14 h-14 bg-[#1E3A2B] text-[#D4A373] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
              Panel Zarządzania Watra Korbielów
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Wprowadź bezpieczny kod dostępu administratora resortu.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Kod dostępu administratora"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isLoggingIn}
              className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest text-neutral-800 focus:outline-hidden focus:border-[#1E3A2B] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-60 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isLoggingIn ? 'Weryfikacja...' : 'Zaloguj do panelu'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#222222] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Top Banner */}
        <div className="bg-[#1E3A2B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#2A4F3B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-[#D4A373] text-[#14281E] rounded-2xl flex items-center justify-center font-bold shadow-md">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
                  {adminText(lang, 'Panel Publikacji Promocji & Rezerwacji')}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  {adminText(lang, 'Aktywny')}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                {adminText(lang, 'Publikuj nowe kampanie marketingowe, kody rabatowe i monitoruj bezpośrednie rezerwacje gości.')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                fetchCampaigns();
                fetchReservations();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{adminText(lang, 'Odśwież')}</span>
            </button>
            <button
              onClick={() => {
                if (isCreating) {
                  setIsCreating(false);
                  resetCampaignForm();
                } else {
                  resetCampaignForm();
                  setIsCreating(true);
                }
              }}
              className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{adminText(lang, isCreating ? 'Anuluj' : 'Nowa Kampania')}</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title={adminText(lang, 'Wyloguj')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{adminText(lang, 'Wyloguj')}</span>
            </button>
          </div>
        </div>

        {/* Status notice */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-200 space-x-3 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('cms')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cms'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>{adminText(lang, 'Zarządzanie Treścią (CMS)')}</span>
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'controls'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>{adminText(lang, 'Widoczność stron i funkcji')}</span>
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'discounts'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>{adminText(lang, 'Kody Rabatowe')}</span>
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Bed className="w-4 h-4 text-amber-800" />
            <span>{adminText(lang, 'Pokoje i Ceny (Baza Centralna)')}</span>
          </button>
          <button
            onClick={() => setActiveTab('live-chat')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'live-chat'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>{adminText(lang, 'AI Concierge & Czat na Żywo')}</span>
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guests'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Tag className="w-4 h-4 text-purple-600" />
            <span>{adminText(lang, 'Stali Goście & Odznaki')}</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Inbox className="w-4 h-4 text-emerald-700" />
            <span>Website inquiries</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{adminText(lang, 'Analityka Na Żywo')}</span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reservations'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{adminText(lang, 'Rezerwacje')} ({reservations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'campaigns'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{adminText(lang, 'Promocje')} ({campaigns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`pb-3 px-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'knowledge'
                ? 'border-[#1E3A2B] text-[#1E3A2B]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4A373]" />
            <span>{adminText(lang, 'Baza Wiedzy AI')} ({knowledgeDocs.length})</span>
          </button>
        </div>

        {/* CREATE CAMPAIGN FORM */}
        {isCreating && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#D4A373]/40 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#D4A373]" />
                <h3 className="font-serif text-xl font-bold text-[#1E3A2B]">
                  {editingCampaignId ? 'Edycja Kampanii Promocyjnej' : 'Kreator Publikacji Kampanii Promocyjnej'}
                </h3>
              </div>
              <span className="text-xs text-neutral-500">
                {editingCampaignId
                  ? 'Zapisanie zmian zaktualizuje kampanię na stronie.'
                  : 'Opublikowana kampania pojawi się od razu na stronie głównej i w module pakiety.'}
              </span>
            </div>

            {campaignFormError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {campaignFormError}
              </p>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    Tytuł Kampanii *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="np. Złota Jesień w Beskidach - Relaks w Górach"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    maxLength={120}
                    className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    Rabat Procentowy (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="5"
                      max="50"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    Cena *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="np. od 1 290 zł / osoba"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A2B] uppercase">
                      Zdjęcie kampanii *
                    </label>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-[#F9F8F6] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Wgrywanie...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>Wybierz zdjęcie z urządzenia</span>
                      </>
                    )}
                  </button>
                </div>

                {imageUploadNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{imageUploadNotice}</span>
                  </div>
                )}

                {formImageUrl && (
                  <div className="relative overflow-hidden rounded-2xl border border-neutral-200 aspect-[16/7] bg-neutral-100">
                    <CmsManagedImage
                      src={formImageUrl}
                      alt="Podgląd zdjęcia kampanii"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/75 to-transparent p-5 pt-12">
                      <div className="flex items-end justify-between gap-4">
                        <h4 className="font-serif text-xl font-bold text-black line-clamp-2">
                          {formTitle || 'Tytuł kampanii'}
                        </h4>
                        <span className="shrink-0 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-bold text-black">
                          -{formDiscount}%
                        </span>
                      </div>
                      {formPrice && <p className="mt-1 text-sm font-semibold text-black">{formPrice}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetCampaignForm();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSavingCampaign || isUploadingImage}
                  className="bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                >
                  {isSavingCampaign
                    ? 'Zapisywanie...'
                    : isUploadingImage
                      ? 'Wgrywanie zdjęcia...'
                    : editingCampaignId ? 'Zapisz Zmiany Kampanii' : 'Opublikuj Kampanię w Serwisie'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: CMS SITE CONTENT MANAGEMENT */}
        {activeTab === 'cms' && (
          <AdminCmsManager lang={lang} />
        )}

        {activeTab === 'controls' && (
          <AdminSiteControls lang={lang} />
        )}

        {/* TAB: DISCOUNT CODES & PROMOTIONS MANAGEMENT */}
        {activeTab === 'discounts' && (
          <AdminDiscountsManager />
        )}

        {/* TAB: ROOMS & PRICES (CENTRAL DATABASE TABLE) */}
        {activeTab === 'rooms' && (
          <AdminRoomsManager lang={lang} />
        )}

        {/* TAB: LIVE AI CONCIERGE & ADMIN TAKEOVER & TRANSLATION */}
        {activeTab === 'live-chat' && (
          <AdminLiveChatManager lang={lang} />
        )}

        {/* TAB: FREQUENT GUESTS, BADGES & COMMUNICATION */}
        {activeTab === 'guests' && (
          <AdminGuestsManager />
        )}

        {activeTab === 'inquiries' && (
          <AdminInquiriesManager />
        )}

        {/* TAB 0: REAL-TIME VISITOR ANALYTICS */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsDashboard />
        )}

        {/* TAB 1: CAMPAIGNS LIST */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1E3A2B]">
                  Zarządzanie Opublikowanymi Kampaniami
                </h2>
                <span className="text-xs text-neutral-500">
                  Łącznie kampanii w bazie: {campaigns.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetCampaignForm();
                  setIsCreating(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A2B] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#2A4F3B]"
              >
                <PlusCircle className="h-4 w-4" />
                Nowa Kampania
              </button>
            </div>

            {isLoadingCampaigns ? (
              <div className="text-center py-12 text-sm text-neutral-500">
                Ładowanie kampanii promocyjnych...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-xs transition-all duration-300 ${
                      camp.active
                        ? 'border-neutral-200/90 hover:shadow-lg'
                        : 'border-neutral-300 grayscale'
                    }`}
                  >
                    <CmsManagedImage
                      src={camp.imageUrl}
                      alt={camp.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/20 to-white/10" />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                      <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold shadow-sm ${
                        camp.active ? 'bg-white/90 text-emerald-800' : 'bg-neutral-800/80 text-white'
                      }`}>
                        {camp.active ? 'Opublikowana' : 'Wstrzymana'}
                      </span>
                      <span className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-bold text-black shadow-sm">
                        -{camp.discountPercentage}%
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold leading-snug text-black drop-shadow-sm">
                          {camp.title}
                        </h3>
                        {camp.price && <p className="mt-1 text-sm font-semibold text-black">{camp.price}</p>}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleActive(camp.id, camp.active)}
                          className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[#1E3A2B] shadow-sm transition-colors hover:bg-white"
                        >
                          {camp.active ? 'Wstrzymaj' : 'Opublikuj'}
                        </button>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => startCampaignEdit(camp)}
                            className="rounded-lg bg-white/90 p-2 text-neutral-600 shadow-sm transition-colors hover:bg-white hover:text-[#1E3A2B]"
                            title="Edytuj kampanię"
                            aria-label={`Edytuj kampanię ${camp.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="rounded-lg bg-white/90 p-2 text-neutral-500 shadow-sm transition-colors hover:bg-white hover:text-red-600"
                            title="Usuń kampanię"
                            aria-label={`Usuń kampanię ${camp.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESERVATIONS INBOX */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#1E3A2B]">
                {adminText(lang, 'Rezerwacje Bezpośrednie z Witryny')}
              </h2>
              <span className="text-xs text-neutral-500">
                {adminText(lang, 'Łącznie zgłoszeń:')} {reservations.length}
              </span>
            </div>

            {isLoadingReservations ? (
              <div className="text-center py-12 text-sm text-neutral-500">
                {adminText(lang, 'Ładowanie rezerwacji...')}
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-neutral-500 text-sm border border-neutral-200">
                {adminText(lang, 'Brak nowych zgłoszeń rezerwacji.')}
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9F8F6] text-[#1E3A2B] font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">{adminText(lang, 'Numer / Data')}</th>
                        <th className="py-3 px-4">{adminText(lang, 'Gość')}</th>
                        <th className="py-3 px-4">{adminText(lang, 'Termin Pobytu')}</th>
                        <th className="py-3 px-4">{adminText(lang, 'Pokój & Osoby')}</th>
                        <th className="py-3 px-4">{adminText(lang, 'Kwota')}</th>
                        <th className="py-3 px-4">{adminText(lang, 'Status')}</th>
                        <th className="py-3 px-4 text-right">{adminText(lang, 'Akcje')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1E3A2B]">
                            <div>{res.id}</div>
                            <div className="text-[10px] text-neutral-600 font-normal">
                              {new Date(res.createdAt).toLocaleDateString(({ pl: 'pl-PL', en: 'en-GB', sk: 'sk-SK', de: 'de-DE' })[lang])}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-900">{res.guestName}</div>
                            <div className="text-neutral-600 text-[11px] flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-neutral-600" />
                              <span>{res.guestPhone}</span>
                            </div>
                            <div className="text-neutral-600 text-[11px] flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-neutral-600" />
                              <span>{res.guestEmail}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-neutral-800">
                              {res.checkIn} → {res.checkOut}
                            </div>
                            <div className="text-[10px] text-neutral-600">
                              {adminText(lang, 'Płatność:')} {adminText(lang, res.paymentMethod === 'transfer' ? 'Przelew bankowy' : 'Na miejscu')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-neutral-800">{res.roomId}</div>
                            <div className="text-[11px] text-neutral-600">
                              {res.adults} {adminText(lang, 'dorosłych,')} {res.children} {adminText(lang, 'dzieci')}
                            </div>
                            {res.specialRequests && (
                              <div className="text-[10px] text-amber-800 italic truncate max-w-xs mt-0.5">
                                "{res.specialRequests}"
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1E3A2B] text-sm">
                            {res.totalAmount} zł
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md ${
                                res.status === 'Potwierdzona'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : res.status === 'Anulowana'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {adminText(lang, res.status)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {res.status !== 'Potwierdzona' && (
                                <button
                                  onClick={() => handleUpdateReservationStatus(res.id, 'Potwierdzona')}
                                  className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                                >
                                  {adminText(lang, 'Zatwierdź')}
                                </button>
                              )}
                              {res.status !== 'Anulowana' && (
                                <button
                                  onClick={() => handleUpdateReservationStatus(res.id, 'Anulowana')}
                                  className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-1 rounded hover:bg-red-600 hover:text-white"
                                >
                                  {adminText(lang, 'Anuluj')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI KNOWLEDGE BASE & DOCUMENT TRAINING */}
        {activeTab === 'knowledge' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Training Stats Banner */}
            <div className="bg-gradient-to-r from-[#1E3A2B] via-[#244735] to-[#1E3A2B] text-white rounded-3xl p-6 sm:p-8 border border-[#D4A373]/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-[#D4A373]/20 text-[#D4A373] text-[11px] font-bold px-3 py-1 rounded-full border border-[#D4A373]/30">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Centrum Karmienia & Treningu Asystenta AI</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
                  Wiedza Operacyjna Resortu Watra Korbielów
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Wgraj dokumenty z faktami o ośrodku, stokach, menu karczmy, jacuzzi czy szlakach na Pilsko. Asystent natychmiast uczy się tych treści i wykorzystuje je, odpowiadając gościom w 4 językach (🇵🇱 Polski, 🇬🇧 English, 🇸🇰 Slovenčina, 🇩🇪 Deutsch).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15 text-center">
                  <div className="text-2xl font-black text-[#D4A373] font-mono">
                    {knowledgeDocs.length}
                  </div>
                  <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                    Wgranych Dokumentów
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15 text-center">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {knowledgeDocs.filter((d) => d.active).length}
                  </div>
                  <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                    Aktywnych w AI
                  </div>
                </div>

                <button
                  onClick={() => setIsCreatingDoc(!isCreatingDoc)}
                  className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <FileUp className="w-4 h-4" />
                  <span>{isCreatingDoc ? 'Zamknij Formularz' : 'Wgraj Nowy Dokument'}</span>
                </button>
              </div>
            </div>

            {/* DOCUMENT UPLOAD & FEEDING FORM */}
            {isCreatingDoc && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#D4A373]/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E3A2B] text-[#D4A373] flex items-center justify-center font-bold">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">
                        Dodaj / Wgraj Dokument do Bazy Wiedzy Asystenta
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Obsługiwane pliki: .txt, .md, .doc, .csv, .json lub wpisz treść bezpośrednio
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateDocument} className="space-y-5">
                  {/* File upload drag & drop bar */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-[#1E3A2B]/30 bg-[#F9F8F6] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-center sm:text-left">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#1E3A2B] shadow-2xs border border-neutral-200 flex items-center justify-center shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E3A2B]">
                          Wybierz plik z dysku komputera
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Automatycznie odczytamy zawartość i wypełnimy formularz
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={docFileInputRef}
                        onChange={handleDocFileUpload}
                        accept=".txt,.md,.doc,.docx,.json,.csv,.rtf"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="bg-white hover:bg-neutral-100 text-[#1E3A2B] border border-neutral-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-2xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#D4A373]" />
                        <span>Wybierz plik tekstowy</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                        Tytuł Dokumentu Wiedzy *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="np. Regulamin Jacuzzi i Sauny 2026, Menu Karczmy, Dojazd na Pilsko..."
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                        Kategoria Tematyczna
                      </label>
                      <select
                        value={docCategory}
                        onChange={(e: any) => setDocCategory(e.target.value)}
                        className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 font-medium cursor-pointer"
                      >
                        <option value="hotel">Pokoje & Regulamin Ośrodka</option>
                        <option value="slopes">Stoki Narciarskie & Wyciągi</option>
                        <option value="restaurant">Restauracja & Karczma Watra</option>
                        <option value="spa">Wellness, Jacuzzi & Sauna</option>
                        <option value="area">Okolica, Szlaki & Słowacja</option>
                        <option value="other">Inne / Informacje Ogólne</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#1E3A2B] uppercase">
                        Treść Dokumentu (Fakty dla AI) *
                      </label>
                      <span className="text-[10px] text-neutral-400">
                        {docContent.length} znaków • AI przeczyta ten tekst przy każdym zapytaniu gościa
                      </span>
                    </div>
                    <textarea
                      required
                      rows={8}
                      placeholder="Wklej tutaj szczegółowe informacje, np. godziny otwarcia, cennik, regulamin sauny, menu regionalne, odległości do wyciągów, zasady pobytu ze zwierzętami..."
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl p-3.5 text-xs text-neutral-800 font-mono leading-relaxed resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingDoc(false)}
                      className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-[#F9F8F6] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-[#D4A373]" />
                      <span>Wgraj i Wytrenuj Asystenta AI</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DOCUMENTS REPOSITORY & FILTER */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1E3A2B]">
                    Zbiór Dokumentów Wiedzy ({knowledgeDocs.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Kliknij przełącznik, aby włączyć lub wyłączyć dany dokument bez konieczności jego usuwania.
                  </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Wszystkie' },
                    { id: 'hotel', label: 'Ośrodek & Pokoje' },
                    { id: 'slopes', label: 'Stoki & Zima' },
                    { id: 'restaurant', label: 'Karczma & Menu' },
                    { id: 'spa', label: 'Wellness & SPA' },
                    { id: 'area', label: 'Okolica & Szlaki' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedDocCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedDocCategoryFilter === cat.id
                          ? 'bg-[#1E3A2B] text-white'
                          : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingKnowledge ? (
                <div className="text-center py-12 text-sm text-neutral-500">
                  Ładowanie bazy wiedzy AI...
                </div>
              ) : knowledgeDocs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 text-sm border border-neutral-200">
                  Brak dokumentów w bazie wiedzy. Dodaj pierwszy dokument powyżej.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {knowledgeDocs
                    .filter(
                      (doc) =>
                        selectedDocCategoryFilter === 'all' ||
                        doc.category === selectedDocCategoryFilter
                    )
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                          doc.active
                            ? 'border-neutral-200 shadow-xs hover:border-[#1E3A2B]/40'
                            : 'border-neutral-200 opacity-60 bg-neutral-50'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                                doc.category === 'hotel'
                                  ? 'bg-blue-100 text-blue-800'
                                  : doc.category === 'slopes'
                                  ? 'bg-sky-100 text-sky-800'
                                  : doc.category === 'restaurant'
                                  ? 'bg-amber-100 text-amber-800'
                                  : doc.category === 'spa'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.category === 'area'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {doc.category}
                            </span>

                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`text-[10px] font-bold ${
                                  doc.active ? 'text-emerald-700' : 'text-neutral-400'
                                }`}
                              >
                                {doc.active ? 'Aktywny w AI' : 'Wstrzymany'}
                              </span>
                              <button
                                onClick={() => handleToggleDoc(doc.id)}
                                className={`w-8 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                                  doc.active ? 'bg-emerald-600' : 'bg-neutral-300'
                                }`}
                                title={doc.active ? 'Kliknij, aby wstrzymać' : 'Kliknij, aby aktywować'}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    doc.active ? 'translate-x-3' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#1E3A2B] line-clamp-1">
                              {doc.title}
                            </h4>
                            <div className="text-[11px] text-neutral-400 flex items-center space-x-2 mt-0.5">
                              <span className="font-mono">{doc.fileName}</span>
                              <span>•</span>
                              <span>{doc.fileSize}</span>
                            </div>
                          </div>

                          <div className="bg-[#F9F8F6] p-3 rounded-xl border border-neutral-100 text-[11px] text-neutral-600 font-mono line-clamp-4 leading-relaxed whitespace-pre-wrap">
                            {doc.content}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400">
                            Dodano: {new Date(doc.createdAt).toLocaleDateString('pl-PL')}
                          </span>

                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="text-neutral-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Usuń dokument z bazy wiedzy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* INTERACTIVE LIVE AI KNOWLEDGE TESTER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4A373] text-[#14281E] flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">
                    Przetestuj Wiedzę Asystenta AI na Żywo
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Zadaj dowolne pytanie (po polsku, angielsku, słowacku lub niemiecku), aby sprawdzić, jak AI odpowiada na podstawie wgranych powyżej dokumentów.
                  </p>
                </div>
              </div>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-neutral-400 self-center text-[11px]">Szybkie pytania testowe:</span>
                {[
                  'O której godzinie jest śniadanie i wymeldowanie?',
                  'Czy jacuzzi pod gwiazdami działa zimą w śniegu?',
                  'Jak blisko jest stok narciarski Cypisek od wejścia?',
                  'Czy w karczmie zjem kwaśnicę na żeberku i pstrąga?',
                  'How close is the Slovak border from Watra?'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestPrompt(sample)}
                    className="bg-[#F9F8F6] hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-lg text-[11px] border border-neutral-200 transition-colors cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>

              <form onSubmit={handleTestAi} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Wpisz pytanie do przetestowania..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="flex-1 bg-[#F9F8F6] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-800 font-medium focus:outline-hidden focus:border-[#1E3A2B]"
                />
                <button
                  type="submit"
                  disabled={isTestingAi || !testPrompt.trim()}
                  className="bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isTestingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generowanie...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Zapytaj AI</span>
                    </>
                  )}
                </button>
              </form>

              {testResponse && (
                <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#D4A373]/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#1E3A2B]">
                    <Bot className="w-4 h-4 text-[#D4A373]" />
                    <span>Odpowiedź Asystenta AI (uwzględniająca wgraną bazę wiedzy):</span>
                  </div>
                  <div className="text-xs text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed pl-6 border-l-2 border-[#D4A373]">
                    {testResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
