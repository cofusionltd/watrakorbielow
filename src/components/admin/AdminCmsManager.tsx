import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { SiteCmsContent, MenuItem, DistanceItem, TreatmentItem } from '../../types';
import { adminFetch } from '../../lib/adminApi';
import { Language } from '../../types';
import { adminText } from '../../adminTranslations';
import { 
  Building2, 
  Sparkles, 
  Info, 
  UtensilsCrossed, 
  Waves, 
  HeartPulse, 
  MapPin, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const AdminCmsManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const { content, updateCmsContent, resetToDefaults } = useCms();
  const [activeTab, setActiveTab] = useState<'resort' | 'hero' | 'about' | 'restaurant' | 'wellness' | 'contact'>('resort');
  
  // Local edit buffer
  const [formData, setFormData] = useState<SiteCmsContent>(content);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync if content changes from server
  React.useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await updateCmsContent(formData);
      if (res.success) {
        setSaveStatus({ type: 'success', message: res.message || 'Wszystkie zmiany w CMS zostały pomyślnie zapisane!' });
      } else {
        setSaveStatus({ type: 'error', message: res.message || 'Wystąpił błąd podczas zapisywania' });
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Błąd połączenia' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const handleReset = async () => {
    if (window.confirm(adminText(lang, 'Czy na pewno chcesz przywrócić domyślne treści CMS? Twoje własne modyfikacje zostaną zastąpione.'))) {
      setSaving(true);
      const ok = await resetToDefaults();
      setSaving(false);
      if (ok) {
        setSaveStatus({ type: 'success', message: 'Przywrócono domyślne treści CMS.' });
      } else {
        setSaveStatus({ type: 'error', message: 'Nie udało się zresetować treści.' });
      }
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  // Image Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await adminFetch('/api/admin/upload-image', {
        method: 'POST',
        body: data,
      });
      if (res.ok) {
        const json = await res.json();
        callback(json.url);
      } else {
        alert(adminText(lang, 'Błąd podczas przesyłania zdjęcia.'));
      }
    } catch (err) {
      alert(adminText(lang, 'Błąd sieci podczas wgrywania pliku.'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Menu item helper functions
  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: 'Nowa potrawa / napój',
      category: 'glowne',
      price: 35,
      description: 'Opis składników, sposób przygotowania i dodatki...',
      badge: 'Nowość',
      isRegional: false,
    };
    setFormData(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        menuItems: [...prev.restaurant.menuItems, newItem],
      }
    }));
  };

  const removeMenuItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        menuItems: prev.restaurant.menuItems.filter(item => item.id !== id),
      }
    }));
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setFormData(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        menuItems: prev.restaurant.menuItems.map(item => item.id === id ? { ...item, ...updates } : item),
      }
    }));
  };

  // Distance helper functions
  const addDistance = () => {
    const newDist: DistanceItem = { name: "Nowa atrakcja lub punkt", dist: "500 m" };
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        distances: [...prev.about.distances, newDist],
      }
    }));
  };

  const removeDistance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        distances: prev.about.distances.filter((_, i) => i !== index),
      }
    }));
  };

  const updateDistance = (index: number, updates: Partial<DistanceItem>) => {
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        distances: prev.about.distances.map((d, i) => i === index ? { ...d, ...updates } : d),
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#1E3A2B] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#D4A373] font-bold bg-white/10 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{adminText(lang, 'Panel Zarządzania Treścią (CMS)')}</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            {adminText(lang, 'Edycja Treści Serwisu Watra Korbielów')}
          </h2>
          <p className="text-sm text-neutral-300">
            {adminText(lang, 'Zmieniaj teksty, dane kontaktowe, menu restauracji, godziny i opisy. Zmiany są od razu widoczne na stronie oraz w Concierge AI.')}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            title={adminText(lang, 'Przywróć domyślne treści')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{adminText(lang, 'Reset domyślne')}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
          >
            {saving ? (
              <span>{adminText(lang, 'Zapisywanie...')}</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{adminText(lang, 'Zapisz w CMS')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {saveStatus && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
          saveStatus.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveStatus.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-neutral-200 shadow-sm text-xs font-semibold">
        {[
          { id: 'resort', label: adminText(lang, 'Resort & Kontakt'), icon: Building2 },
          { id: 'hero', label: adminText(lang, 'Baner Główny'), icon: Sparkles },
          { id: 'about', label: adminText(lang, 'O Nas & Odległości'), icon: Info },
          { id: 'restaurant', label: adminText(lang, 'Karczma & Menu'), icon: UtensilsCrossed },
          { id: 'wellness', label: adminText(lang, 'Jacuzzi & Sauna'), icon: Waves },
          { id: 'contact', label: adminText(lang, 'Dojazd & Stopka'), icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#1E3A2B] text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-[#1E3A2B] hover:bg-neutral-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-8">

        {/* TAB 1: RESORT & CONTACT */}
        {activeTab === 'resort' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Podstawowe Dane Ośrodka & Kontakt')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Informacje teleadresowe, godziny recepcji, gwarancja rabatu bezpośredniego.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Nazwa Obiektu')}</label>
                <input
                  type="text"
                  value={formData.resort.name}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, name: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Hasło Przewodnie (Tagline)')}</label>
                <input
                  type="text"
                  value={formData.resort.tagline}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, tagline: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Krótki Opis Ośrodka')}</label>
                <textarea
                  rows={2}
                  value={formData.resort.description}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, description: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Ulica i Numer')}</label>
                <input
                  type="text"
                  value={formData.resort.address}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, address: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Kod Pocztowy i Miejscowość')}</label>
                <input
                  type="text"
                  value={formData.resort.postalCity}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, postalCity: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Telefon Główny')}</label>
                <input
                  type="text"
                  value={formData.resort.phone}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, phone: e.target.value, phoneFormatted: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Adres E-mail Rezerwacji')}</label>
                <input
                  type="email"
                  value={formData.resort.bookingEmail}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, bookingEmail: e.target.value, email: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Godziny Pracy Recepcji')}</label>
                <input
                  type="text"
                  value={formData.resort.receptionHours}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, receptionHours: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Doba od (Check-in)')}</label>
                  <input
                    type="text"
                    value={formData.resort.checkInTime}
                    onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, checkInTime: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Doba do (Check-out)')}</label>
                  <input
                    type="text"
                    value={formData.resort.checkOutTime}
                    onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, checkOutTime: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Numer Konta Bankowego')}</label>
                <input
                  type="text"
                  value={formData.resort.bankAccount}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, bankAccount: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Rabat Bezpośredni (%)')}</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={formData.resort.directDiscountPercent}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, directDiscountPercent: parseInt(e.target.value) || 0 } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B]"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase">{adminText(lang, 'Górna Belka Ogłoszeniowa (Nagłówek)')}</span>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.resort.showAnnouncement}
                      onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, showAnnouncement: e.target.checked } }))}
                      className="rounded text-[#1E3A2B] focus:ring-[#1E3A2B]"
                    />
                    <span>{adminText(lang, 'Wyświetlaj ogłoszenie na górze strony')}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.resort.announcementBanner}
                  onChange={e => setFormData(prev => ({ ...prev, resort: { ...prev.resort, announcementBanner: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-amber-300 bg-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder={adminText(lang, 'np. ❄️ 100 m do wyciągów Cypisek & Andiamo...')}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO BANNER */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Baner Główny (Hero)')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Główny widok witryny, hasła promocyjne, odtwarzacz wideo i przyciski akcji.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Nadtytuł (Eyebrow)')}</label>
                <input
                  type="text"
                  value={formData.hero.eyebrow}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, eyebrow: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Plakietka Rabatowa')}</label>
                <input
                  type="text"
                  value={formData.hero.badgeText}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, badgeText: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Początek Tytułu')}</label>
                <input
                  type="text"
                  value={formData.hero.title}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Wyróżnione Słowo (Złote)')}</label>
                <input
                  type="text"
                  value={formData.hero.highlightWord}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, highlightWord: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Podtytuł Hero')}</label>
                <textarea
                  rows={2}
                  value={formData.hero.subtitle}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Napis na Przycisku Głównym (Rezerwuj)')}</label>
                <input
                  type="text"
                  value={formData.hero.ctaPrimaryText}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, ctaPrimaryText: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Napis na Przycisku Drugim (Stoki)')}</label>
                <input
                  type="text"
                  value={formData.hero.ctaSecondaryText}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, ctaSecondaryText: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#1E3A2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Zdjęcie w Tle (Poster)')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.hero.posterImage}
                    onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, posterImage: e.target.value } }))}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                  />
                  <label className="bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2.5 rounded-xl flex items-center justify-center cursor-pointer text-xs font-semibold text-neutral-700 border border-neutral-300">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    {adminText(lang, 'Wgraj')}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleUpload(e, url => setFormData(prev => ({ ...prev, hero: { ...prev.hero, posterImage: url } })))}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Link Wideo YouTube (Prezentacja)')}</label>
                <input
                  type="text"
                  value={formData.hero.videoUrl}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero, videoUrl: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT & DISTANCES */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Sekcja O Nas & Położenie')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Historia Watry, walory lokalizacji oraz lista odległości do stoków i szlaków.')}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Tytuł Sekcji')}</label>
                  <input
                    type="text"
                    value={formData.about.title}
                    onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Plakietka')}</label>
                  <input
                    type="text"
                    value={formData.about.badge}
                    onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, badge: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Wstęp (Lead)')}</label>
                <textarea
                  rows={2}
                  value={formData.about.lead}
                  onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, lead: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Akapit 1: Pochodzenie i Misja')}</label>
                <textarea
                  rows={3}
                  value={formData.about.storyParagraph1}
                  onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, storyParagraph1: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Akapit 2: Zima i Lato u Stóp Pilska')}</label>
                <textarea
                  rows={3}
                  value={formData.about.storyParagraph2}
                  onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, storyParagraph2: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Akapit 3: Ogród, Jacuzzi i Biesiady')}</label>
                <textarea
                  rows={3}
                  value={formData.about.storyParagraph3}
                  onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about, storyParagraph3: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              {/* Distances List Editor */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#1E3A2B] uppercase tracking-wide">{adminText(lang, 'Odległości od Obiektu')}</h4>
                    <p className="text-xs text-neutral-500">{adminText(lang, 'Wyświetlane na stronie O Nas oraz wykorzystywane przez Asystenta AI.')}</p>
                  </div>
                  <button
                    onClick={addDistance}
                    className="flex items-center space-x-1 bg-[#1E3A2B] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#2A4F3B]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{adminText(lang, 'Dodaj Punkt')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.about.distances.map((dist, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#F9F8F6] p-2.5 rounded-xl border border-neutral-200">
                      <input
                        type="text"
                        value={dist.name}
                        onChange={e => updateDistance(idx, { name: e.target.value })}
                        className="flex-grow px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium"
                        placeholder={adminText(lang, 'Nazwa miejsca...')}
                      />
                      <input
                        type="text"
                        value={dist.dist}
                        onChange={e => updateDistance(idx, { dist: e.target.value })}
                        className="w-28 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-amber-800"
                        placeholder="np. 100 m"
                      />
                      <button
                        onClick={() => removeDistance(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title={adminText(lang, 'Usuń')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESTAURANT & MENU */}
        {activeTab === 'restaurant' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Karczma Regionalna & Karta Menu')}</h3>
                <p className="text-xs text-neutral-500">{adminText(lang, 'Zarządzaj potrawami, cenami, godzinami posiłków i wiatą grillową.')}</p>
              </div>
              <button
                onClick={addMenuItem}
                className="flex items-center space-x-1.5 bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{adminText(lang, 'Dodaj Potrawę')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Godziny Restauracji a la carte')}</label>
                <input
                  type="text"
                  value={formData.restaurant.openingHours}
                  onChange={e => setFormData(prev => ({ ...prev, restaurant: { ...prev.restaurant, openingHours: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Godziny Śniadań Bufetowych')}</label>
                <input
                  type="text"
                  value={formData.restaurant.breakfastHours}
                  onChange={e => setFormData(prev => ({ ...prev, restaurant: { ...prev.restaurant, breakfastHours: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Godziny Obiadokolacji')}</label>
                <input
                  type="text"
                  value={formData.restaurant.dinnerHours}
                  onChange={e => setFormData(prev => ({ ...prev, restaurant: { ...prev.restaurant, dinnerHours: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Opis Wiaty Grillowej & Biesiad')}</label>
              <textarea
                rows={2}
                value={formData.restaurant.fireplaceShelterInfo}
                onChange={e => setFormData(prev => ({ ...prev, restaurant: { ...prev.restaurant, fireplaceShelterInfo: e.target.value } }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            {/* Menu Items List */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-[#1E3A2B] uppercase tracking-wider flex items-center justify-between">
                <span>{adminText(lang, 'Pozycje Menu')} ({formData.restaurant.menuItems.length})</span>
                <span className="text-xs text-neutral-400 font-normal">{adminText(lang, 'Wszystkie potrawy są automatycznie prezentowane w karcie dań i znane Concierge AI')}</span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {formData.restaurant.menuItems.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-neutral-200 bg-[#FDFBF7] space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">{adminText(lang, 'Nazwa Dania')}</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={e => updateMenuItem(item.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-[#1E3A2B]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">{adminText(lang, 'Kategoria')}</label>
                          <select
                            value={item.category}
                            onChange={e => updateMenuItem(item.id, { category: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold"
                          >
                            <option value="zupy">{adminText(lang, 'Zupy')}</option>
                            <option value="glowne">{adminText(lang, 'Dania Główne')}</option>
                            <option value="przekaski">{adminText(lang, 'Przekąski')}</option>
                            <option value="regionalne">{adminText(lang, 'Regionalne')}</option>
                            <option value="desery">{adminText(lang, 'Desery')}</option>
                            <option value="napoje">{adminText(lang, 'Napoje / Grzańce')}</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">{adminText(lang, 'Cena (zł)')}</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={e => updateMenuItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-emerald-800"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeMenuItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 shrink-0"
                        title={adminText(lang, 'Usuń danie z menu')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase">{adminText(lang, 'Opis / Składniki')}</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateMenuItem(item.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-neutral-500 uppercase">{adminText(lang, 'Plakietka (opcjonalna)')}</label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          onChange={e => updateMenuItem(item.id, { badge: e.target.value })}
                          placeholder={adminText(lang, 'np. Bestseller, Specjalność')}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WELLNESS & JACUZZI */}
        {activeTab === 'wellness' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Strefa Relaksu & Jacuzzi')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Zarządzaj informacjami o zewnętrznym jacuzzi, saunie fińskiej i seansach na wyłączność.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Tytuł Jacuzzi')}</label>
                <input
                  type="text"
                  value={formData.wellness.jacuzziTitle}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, jacuzziTitle: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Temperatura Wody')}</label>
                  <input
                    type="text"
                    value={formData.wellness.jacuzziTemp}
                    onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, jacuzziTemp: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Godziny Otwarcia')}</label>
                  <input
                    type="text"
                    value={formData.wellness.jacuzziHours}
                    onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, jacuzziHours: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Opis Kąpieli w Jacuzzi')}</label>
                <textarea
                  rows={3}
                  value={formData.wellness.jacuzziDescription}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, jacuzziDescription: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Tytuł Sauny')}</label>
                <input
                  type="text"
                  value={formData.wellness.saunaTitle}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, saunaTitle: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Temperatura Sauny')}</label>
                <input
                  type="text"
                  value={formData.wellness.saunaTemp}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, saunaTemp: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold text-red-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Opis Sauny Fińskiej')}</label>
                <textarea
                  rows={2}
                  value={formData.wellness.saunaDescription}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, saunaDescription: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Pakiet VIP na Wyłączność (z Winem)')}</label>
                <textarea
                  rows={2}
                  value={formData.wellness.vipReservationNote}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, vipReservationNote: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Informacja o Cenach / Wstępie')}</label>
                <textarea
                  rows={2}
                  value={formData.wellness.pricingNote}
                  onChange={e => setFormData(prev => ({ ...prev, wellness: { ...prev.wellness, pricingNote: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DIRECTIONS & FOOTER */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Wskazówki Dojazdu & Treść Stopki')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Informacje o dojeździe, parkingu, GPS oraz treść notki informacyjnej w stopce serwisu.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Dojazd Samochodem')}</label>
                <textarea
                  rows={2}
                  value={formData.contact.directionsInfo}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, directionsInfo: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Informacja o Parkingu')}</label>
                <textarea
                  rows={2}
                  value={formData.contact.parkingInfo}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, parkingInfo: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Współrzędne GPS')}</label>
                <input
                  type="text"
                  value={formData.contact.gpsCoordinates}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, gpsCoordinates: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Komunikacja Publiczna (Autobus)')}</label>
                <input
                  type="text"
                  value={formData.contact.publicTransportInfo}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, publicTransportInfo: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Krótki Tekst o Obiekcie w Stopce')}</label>
                <textarea
                  rows={3}
                  value={formData.footer.aboutSnippet}
                  onChange={e => setFormData(prev => ({ ...prev, footer: { ...prev.footer, aboutSnippet: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
