import React, { useMemo, useRef, useState } from 'react';
import { collectTranslatableStrings, useCms } from '../../context/CmsContext';
import { SiteCmsContent, MenuItem, DistanceItem, TreatmentItem } from '../../types';
import { adminFetch } from '../../lib/adminApi';
import { Language } from '../../types';
import { adminText } from '../../adminTranslations';
import { translations } from '../../translations';
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
  ExternalLink,
  Image as ImageIcon,
  ImageOff,
  Languages,
  Search,
  Pencil
} from 'lucide-react';
import { CMS_IMAGE_REMOVED } from '../../context/CmsContext';

interface CmsMediaAsset {
  name: string;
  url: string;
}

const MAX_IMAGE_UPLOAD_BYTES = 35 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);

const containsMediaUrl = (value: unknown, url: string): boolean => {
  if (value === url) return true;
  if (Array.isArray(value)) return value.some(item => containsMediaUrl(item, url));
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, nestedValue]) => key === url || containsMediaUrl(nestedValue, url));
  }
  return false;
};

export const AdminCmsManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const { content, updateCmsContent, resetToDefaults } = useCms();
  const [activeTab, setActiveTab] = useState<'resort' | 'hero' | 'about' | 'restaurant' | 'wellness' | 'contact' | 'translations' | 'media'>('resort');
  const [translationLanguage, setTranslationLanguage] = useState<Language>(lang);
  const [translationSection, setTranslationSection] = useState('all');
  const [translationSearch, setTranslationSearch] = useState('');
  const [mediaAssets, setMediaAssets] = useState<CmsMediaAsset[]>([]);
  const [selectedImageSource, setSelectedImageSource] = useState('');
  const [replacementImage, setReplacementImage] = useState('');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  
  // Local edit buffer
  const [formData, setFormData] = useState<SiteCmsContent>(content);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingImageChanges, setSavingImageChanges] = useState(false);
  const imageEditorRef = useRef<HTMLDivElement>(null);
  const replacementSelectRef = useRef<HTMLSelectElement>(null);
  const pendingImageSaveFormDataRef = useRef<SiteCmsContent | null>(null);

  // Sync if content changes from server
  React.useEffect(() => {
    const pendingFormData = pendingImageSaveFormDataRef.current;
    if (pendingFormData) {
      pendingImageSaveFormDataRef.current = null;
      setFormData({ ...pendingFormData, imageOverrides: content.imageOverrides });
      return;
    }
    setFormData(content);
  }, [content]);

  React.useEffect(() => {
    if (activeTab !== 'media') return;
    let active = true;
    setMediaLoading(true);
    setMediaError(null);
    adminFetch('/api/admin/media')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'MEDIA_LIST_FAILED');
        if (active) {
          setMediaAssets(data);
          setSelectedImageSource((current) => current || data[0]?.url || '');
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load CMS media library:', error);
        if (active) setMediaError(adminText(lang, 'Nie udało się wczytać biblioteki zdjęć.'));
      })
      .finally(() => {
        if (active) setMediaLoading(false);
      });
    return () => { active = false; };
  }, [activeTab, lang]);

  const translationEntries = useMemo(
    () => collectTranslatableStrings(translations[translationLanguage]),
    [translationLanguage],
  );
  const translationSections = useMemo(
    () => [...new Set(translationEntries.map(({ key }) => key.split('.')[0]))],
    [translationEntries],
  );
  const visibleTranslationEntries = translationEntries.filter(({ key, value }) =>
    (translationSection === 'all' || key.split('.')[0] === translationSection)
    && (!translationSearch || `${key} ${value}`.toLocaleLowerCase().includes(translationSearch.toLocaleLowerCase())),
  );

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await updateCmsContent(formData);
      if (res.success) {
        setSaveStatus({ type: 'success', message: adminText(lang, 'Wszystkie zmiany w CMS zostały pomyślnie zapisane!') });
      } else {
        setSaveStatus({ type: 'error', message: adminText(lang, 'Wystąpił błąd podczas zapisywania') });
      }
    } catch (error) {
      console.error('Failed to save CMS image changes:', error);
      setSaveStatus({ type: 'error', message: adminText(lang, 'Błąd połączenia') });
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
    setMediaError(null);
    setMediaNotice(null);

    try {
      if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        throw new Error(adminText(lang, 'Obsługiwane formaty zdjęć to AVIF, GIF, JPG, PNG, SVG i WebP.'));
      }
      if (file.size === 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error(adminText(lang, 'Plik jest pusty albo przekracza limit 35 MB.'));
      }
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error(adminText(lang, 'Nie udało się odczytać obrazu.')));
        reader.onerror = () => reject(new Error(adminText(lang, 'Nie udało się odczytać obrazu.')));
        reader.readAsDataURL(file);
      });
      const res = await adminFetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, fileName: file.name }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error('Image upload failed:', result);
        throw new Error(typeof result.error === 'string'
          ? result.error
          : adminText(lang, 'Błąd podczas przesyłania zdjęcia.'));
      }
      if (typeof result.url !== 'string' || !result.url.startsWith('/images/')) {
        throw new Error(adminText(lang, 'Serwer zwrócił nieprawidłowy adres zdjęcia.'));
      }
      callback(result.url);
      setMediaNotice(adminText(lang, 'Zdjęcie dodano do biblioteki. Wybierz je i kliknij „Zamień zdjęcie”, aby od razu podmienić wybrane zdjęcie na stronie.'));
    } catch (err) {
      console.error('Image upload failed:', err);
      setMediaError(err instanceof Error
        ? err.message
        : adminText(lang, 'Błąd sieci podczas wgrywania pliku.'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const selectImageSource = (url: string) => {
    setSelectedImageSource(url);
    const currentOverride = formData.imageOverrides?.[url];
    setReplacementImage(currentOverride && currentOverride !== CMS_IMAGE_REMOVED ? currentOverride : '');
  };

  const handleEditImage = (url: string) => {
    selectImageSource(url);
    window.requestAnimationFrame(() => {
      imageEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replacementSelectRef.current?.focus({ preventScroll: true });
    });
  };

  const handleReplaceImage = async () => {
    if (!selectedImageSource || !replacementImage) return;
    const previousImageOverrides = formData.imageOverrides;
    const imageOverrides = { ...formData.imageOverrides };
    if (replacementImage === selectedImageSource) {
      delete imageOverrides[selectedImageSource];
    } else {
      imageOverrides[selectedImageSource] = replacementImage;
    }
    setFormData(previous => ({ ...previous, imageOverrides }));
    if (await persistImageOverrides(imageOverrides)) {
      setMediaNotice(adminText(lang, 'Zdjęcie zostało podmienione na stronie.'));
    } else {
      setFormData(previous => ({ ...previous, imageOverrides: previousImageOverrides }));
    }
  };

  const handleRemoveImageFromSite = async () => {
    if (!selectedImageSource) return;
    if (!window.confirm(adminText(lang, 'Czy usunąć to zdjęcie ze strony we wszystkich miejscach, w których jest używane?'))) return;
    const previousImageOverrides = formData.imageOverrides;
    const previousReplacementImage = replacementImage;
    const imageOverrides = { ...formData.imageOverrides, [selectedImageSource]: CMS_IMAGE_REMOVED };
    setFormData(previous => ({ ...previous, imageOverrides }));
    setReplacementImage('');
    if (await persistImageOverrides(imageOverrides)) {
      setMediaNotice(adminText(lang, 'Zdjęcie zostało usunięte ze strony.'));
    } else {
      setFormData(previous => ({ ...previous, imageOverrides: previousImageOverrides }));
      setReplacementImage(previousReplacementImage);
    }
  };

  const handleRestoreImage = async () => {
    if (!selectedImageSource) return;
    const previousImageOverrides = formData.imageOverrides;
    const previousReplacementImage = replacementImage;
    const imageOverrides = { ...formData.imageOverrides };
    delete imageOverrides[selectedImageSource];
    setFormData(previous => ({ ...previous, imageOverrides }));
    setReplacementImage('');
    if (await persistImageOverrides(imageOverrides)) {
      setMediaNotice(adminText(lang, 'Zdjęcie zostało przywrócone na stronie.'));
    } else {
      setFormData(previous => ({ ...previous, imageOverrides: previousImageOverrides }));
      setReplacementImage(previousReplacementImage);
    }
  };

  const persistImageOverrides = async (imageOverrides: Record<string, string>) => {
    pendingImageSaveFormDataRef.current = { ...formData, imageOverrides };
    setSavingImageChanges(true);
    setMediaError(null);
    setMediaNotice(null);
    try {
      const result = await updateCmsContent({ imageOverrides });
      if (!result.success) {
        pendingImageSaveFormDataRef.current = null;
        console.error('Failed to save CMS image changes:', result.message);
        setMediaError(adminText(lang, 'Nie udało się zapisać zmiany zdjęcia. Spróbuj ponownie.'));
        return false;
      }
      setFormData(previous => ({ ...previous, imageOverrides }));
      return true;
    } catch (error) {
      pendingImageSaveFormDataRef.current = null;
      console.error('Failed to save CMS image changes:', error);
      setMediaError(adminText(lang, 'Nie udało się zapisać zmiany zdjęcia. Spróbuj ponownie.'));
      return false;
    } finally {
      setSavingImageChanges(false);
    }
  };

  const handleDeleteUploadedImage = async (asset: CmsMediaAsset) => {
    if (!asset.name.startsWith('upload-') || deletingImage) return;
    if (containsMediaUrl(formData, asset.url)) {
      setMediaError(adminText(lang, 'Nie można usunąć pliku, ponieważ jest nadal używany przez treść strony lub pokój.'));
      return;
    }
    if (!window.confirm(adminText(lang, 'Czy trwale usunąć przesłany plik z biblioteki? Tej czynności nie można cofnąć.'))) return;

    setDeletingImage(asset.url);
    setMediaError(null);
    try {
      const response = await adminFetch(`/api/admin/media/${encodeURIComponent(asset.name)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'MEDIA_DELETE_FAILED');

      setMediaAssets(previous => previous.filter(item => item.url !== asset.url));
      if (selectedImageSource === asset.url) {
        const nextSource = mediaAssets.find(item => item.url !== asset.url)?.url || '';
        selectImageSource(nextSource);
      }
      if (replacementImage === asset.url) setReplacementImage('');
      setMediaNotice(adminText(lang, 'Zdjęcie zostało usunięte z biblioteki.'));
    } catch (error) {
      const code = error instanceof Error ? error.message : 'MEDIA_DELETE_FAILED';
      const localizedErrors: Record<string, string> = {
        MEDIA_FILE_IN_USE: 'Nie można usunąć pliku, ponieważ jest nadal używany przez treść strony lub pokój.',
        MEDIA_FILE_NOT_MANAGED: 'Można trwale usuwać tylko zdjęcia przesłane do biblioteki. Każde zdjęcie można usunąć ze strony.',
        MEDIA_FILE_NOT_FOUND: 'Nie znaleziono pliku obrazu. Odśwież bibliotekę i spróbuj ponownie.',
        MEDIA_DELETE_FAILED: 'Nie udało się usunąć zdjęcia. Sprawdź logi serwera i spróbuj ponownie.',
        MEDIA_REFERENCE_CHECK_FAILED: 'Nie udało się sprawdzić, czy zdjęcie jest używane. Plik nie został usunięty; spróbuj ponownie później.',
      };
      console.error('Failed to delete CMS media asset:', error);
      setMediaError(adminText(lang, localizedErrors[code] || 'Nie udało się usunąć zdjęcia.'));
    } finally {
      setDeletingImage(null);
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
            disabled={saving || savingImageChanges}
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
          { id: 'translations', label: adminText(lang, 'Teksty strony'), icon: Languages },
          { id: 'media', label: adminText(lang, 'Zdjęcia'), icon: ImageIcon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Nagłówek Fitness & Wellbeing')}</label>
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
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">{adminText(lang, 'Opis Fitness & Wellbeing')}</label>
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

        {activeTab === 'translations' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Teksty i tłumaczenia strony')}</h3>
              <p className="text-xs text-neutral-500">
                {adminText(lang, 'Edytuj teksty interfejsu używane na stronach publicznych. Zmiany dotyczą wybranego języka i są widoczne po zapisaniu CMS.')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1 text-xs font-semibold text-neutral-700">
                <span>{adminText(lang, 'Język')}</span>
                <select
                  value={translationLanguage}
                  onChange={event => setTranslationLanguage(event.target.value as Language)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm"
                >
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                  <option value="sk">Slovenčina</option>
                  <option value="de">Deutsch</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-neutral-700">
                <span>{adminText(lang, 'Sekcja strony')}</span>
                <select
                  value={translationSection}
                  onChange={event => setTranslationSection(event.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm"
                >
                  <option value="all">{adminText(lang, 'Wszystkie sekcje')}</option>
                  {translationSections.map(section => <option key={section} value={section}>{section}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-neutral-700">
                <span>{adminText(lang, 'Szukaj tekstu')}</span>
                <span className="flex items-center rounded-xl border border-neutral-300 px-3">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    value={translationSearch}
                    onChange={event => setTranslationSearch(event.target.value)}
                    className="w-full border-0 px-2 py-2.5 text-sm outline-none"
                    placeholder={adminText(lang, 'Nazwa lub treść')}
                  />
                </span>
              </label>
            </div>
            <p className="text-xs text-neutral-500">
              {adminText(lang, 'Pola tekstowe')}: {visibleTranslationEntries.length}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleTranslationEntries.map(({ key, value }) => {
                const currentValue = formData.translationOverrides?.[translationLanguage]?.[key] ?? value;
                const updateValue = (nextValue: string) => setFormData(previous => ({
                  ...previous,
                  translationOverrides: {
                    ...previous.translationOverrides,
                    [translationLanguage]: {
                      ...previous.translationOverrides?.[translationLanguage],
                      [key]: nextValue,
                    },
                  },
                }));
                return (
                  <label key={key} className="space-y-1 text-xs font-semibold text-neutral-700">
                    <span className="break-all">{key}</span>
                    {value.length > 110 ? (
                      <textarea
                        rows={3}
                        value={currentValue}
                        onChange={event => updateValue(event.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal"
                      />
                    ) : (
                      <input
                        value={currentValue}
                        onChange={event => updateValue(event.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {visibleTranslationEntries.length === 0 && (
              <p className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">{adminText(lang, 'Brak tekstów pasujących do wyszukiwania.')}</p>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-[#1E3A2B]">{adminText(lang, 'Biblioteka zdjęć strony')}</h3>
              <p className="text-xs text-neutral-500">{adminText(lang, 'Wgraj zdjęcie z komputera, wybierz zdjęcie do podmiany i kliknij „Zamień zdjęcie”. Podmiana, usunięcie i przywrócenie zapisują się od razu.')}</p>
              <p className="mt-1 text-xs text-neutral-500">{adminText(lang, 'Możesz też usunąć obraz ze strony. Przesłane pliki można trwale skasować, jeśli nie są używane.')}</p>
            </div>
            {mediaError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{mediaError}</p>}
            {mediaNotice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{mediaNotice}</p>}
            {mediaLoading && <p className="text-sm text-neutral-500">{adminText(lang, 'Wczytywanie zdjęć...')}</p>}
            {!mediaLoading && mediaAssets.length === 0 && !mediaError && (
              <p className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">{adminText(lang, 'Brak zdjęć w bibliotece.')}</p>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div ref={imageEditorRef} className="space-y-2 rounded-xl text-xs font-semibold text-neutral-700">
                <label className="block">
                  <span className="mb-2 block">{adminText(lang, 'Zdjęcie do podmiany')}</span>
                  <select
                    value={selectedImageSource}
                    onChange={event => selectImageSource(event.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm"
                  >
                    {mediaAssets.map(asset => <option key={asset.url} value={asset.url}>{asset.name}</option>)}
                  </select>
                </label>
                {selectedImageSource && (
                  formData.imageOverrides?.[selectedImageSource] === CMS_IMAGE_REMOVED
                    ? <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500">
                        <ImageOff className="h-8 w-8" />
                        <span>{adminText(lang, 'Zdjęcie jest ukryte na stronie.')}</span>
                      </div>
                    : <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                        <img
                          src={formData.imageOverrides?.[selectedImageSource] || selectedImageSource}
                          alt={mediaAssets.find(asset => asset.url === selectedImageSource)?.name || ''}
                          className="h-56 w-full object-cover"
                        />
                      </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-700">
                  <span className="mb-2 block">{adminText(lang, 'Wybierz nowe zdjęcie')}</span>
                  <select
                    ref={replacementSelectRef}
                    value={replacementImage}
                    onChange={event => setReplacementImage(event.target.value)}
                    disabled={!selectedImageSource}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-normal"
                  >
                    <option value="">{adminText(lang, 'Wybierz obraz z biblioteki')}</option>
                    {mediaAssets.map(asset => <option key={asset.url} value={asset.url}>{asset.name}</option>)}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleReplaceImage()}
                    disabled={!selectedImageSource || !replacementImage || uploadingImage || savingImageChanges}
                    className="rounded-lg bg-[#1E3A2B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2A4F3B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingImageChanges ? adminText(lang, 'Zapisywanie...') : adminText(lang, 'Zamień zdjęcie')}
                  </button>
                  <label className={`cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 ${uploadingImage ? 'pointer-events-none opacity-50' : ''}`}>
                    <Upload className="mr-1 inline h-4 w-4" />
                    {uploadingImage ? adminText(lang, 'Wgrywanie...') : adminText(lang, 'Wgraj zdjęcie')}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="sr-only"
                      onChange={event => handleUpload(event, url => {
                        const name = url.split('/').pop() || url;
                        setMediaAssets(previous => [ ...previous.filter(asset => asset.url !== url), { name, url } ]);
                        setReplacementImage(url);
                      })}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedImageSource && formData.imageOverrides?.[selectedImageSource] !== CMS_IMAGE_REMOVED && (
                    <button
                      type="button"
                      onClick={() => void handleRemoveImageFromSite()}
                      disabled={savingImageChanges}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      {savingImageChanges ? adminText(lang, 'Zapisywanie...') : adminText(lang, 'Usuń ze strony')}
                    </button>
                  )}
                  {selectedImageSource && formData.imageOverrides?.[selectedImageSource] && (
                    <button
                      type="button"
                      onClick={() => void handleRestoreImage()}
                      disabled={savingImageChanges}
                      className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      {savingImageChanges ? adminText(lang, 'Zapisywanie...') : adminText(lang, 'Przywróć zdjęcie')}
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500">{mediaAssets.length} {adminText(lang, 'zdjęć w bibliotece')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {mediaAssets.map(asset => (
                <div
                  key={asset.url}
                  className={`overflow-hidden rounded-xl border transition-colors ${selectedImageSource === asset.url ? 'border-[#1E3A2B] ring-2 ring-[#1E3A2B]/20' : 'border-neutral-200 hover:border-neutral-400'}`}
                >
                  <button type="button" onClick={() => selectImageSource(asset.url)} className="block w-full text-left">
                    {formData.imageOverrides?.[asset.url] === CMS_IMAGE_REMOVED
                      ? <span className="flex h-24 items-center justify-center bg-neutral-100 text-neutral-400"><ImageOff className="h-6 w-6" /></span>
                      : <img src={formData.imageOverrides?.[asset.url] || asset.url} alt={asset.name} className="h-24 w-full object-cover" />}
                    <span className="block truncate px-2 py-1.5 text-[10px] text-neutral-700">{asset.name}</span>
                  </button>
                  <div className="flex items-center justify-between border-t border-neutral-100 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditImage(asset.url)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E3A2B] hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      {adminText(lang, 'Edytuj')}
                    </button>
                    {asset.name.startsWith('upload-') && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteUploadedImage(asset)}
                        disabled={deletingImage === asset.url || containsMediaUrl(formData, asset.url)}
                        title={containsMediaUrl(formData, asset.url)
                          ? adminText(lang, 'Nie można usunąć pliku, ponieważ jest nadal używany przez treść strony lub pokój.')
                          : adminText(lang, 'Usuń plik')}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingImage === asset.url ? adminText(lang, 'Usuwanie...') : adminText(lang, 'Usuń plik')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
