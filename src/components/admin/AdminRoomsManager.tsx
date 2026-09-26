import React, { useState, useEffect } from 'react';
import {
  Bed,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Tag,
  Users,
  Maximize2,
  DollarSign,
  AlertCircle,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Room } from '../../types';
import { adminFetch } from '../../lib/adminApi';
import { Language } from '../../types';
import { adminText } from '../../adminTranslations';

export const AdminRoomsManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit / Create modal state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'double' | 'family' | 'suite'>('double');
  const [basePrice, setBasePrice] = useState<number>(180);
  const [capacity, setCapacity] = useState<number>(2);
  const [size, setSize] = useState('20 m²');
  const [bedConfig, setBedConfig] = useState('1 łoże małżeńskie King-Size');
  const [imagesText, setImagesText] = useState('/images/image-22.jpg\n/images/image-23.jpg');
  const [tagsText, setTagsText] = useState('Śniadanie w cenie, Prywatna łazienka, TV LED, Wi-Fi, Widok na las');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Błąd ładowania pokoi z bazy');
      const data = await res.json();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać listy pokoi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingRoom(null);
    setName('');
    setCategory('double');
    setBasePrice(190);
    setCapacity(2);
    setSize('22 m²');
    setBedConfig('1 łoże małżeńskie');
    setImagesText('/images/image-22.jpg\n/images/image-23.jpg\n/images/image-25.jpg');
    setTagsText('Śniadanie w cenie, Prywatna łazienka, TV LED, Wi-Fi, Balkon');
    setDescription('Nowoczesny, przytulny pokój w stylu alpejskim z widokiem na lasy Pilska.');
    setActive(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setIsCreating(false);
    setName(room.name);
    setCategory(room.category);
    setBasePrice(room.basePrice);
    setCapacity(room.capacity);
    setSize(room.size);
    setBedConfig(room.bedConfig);
    setImagesText(room.images.join('\n'));
    setTagsText(room.tags.join(', '));
    setDescription(room.description);
    setActive(room.active !== undefined ? room.active : true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const images = imagesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const tags = tagsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      name,
      category,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      size,
      bedConfig,
      images: images.length > 0 ? images : ['/images/image-22.jpg'],
      tags: tags.length > 0 ? tags : ['Wi-Fi'],
      description,
      active,
    };

    try {
      if (isCreating) {
        const res = await adminFetch('/api/admin/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Błąd zapisu nowego pokoju');
        const data = await res.json();
        setSuccessMsg(`Pokój "${name}" został pomyślnie dodany do centralnej bazy danych!`);
      } else if (editingRoom) {
        const res = await adminFetch(`/api/admin/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Błąd aktualizacji pokoju');
        setSuccessMsg(`Pokój "${name}" został zaktualizowany w bazie danych!`);
      }
      closeModal();
      window.dispatchEvent(new CustomEvent('rooms_updated'));
      await fetchRooms();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania.');
    }
  };

  const handleDelete = async (roomId: string, roomName: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć pokój "${roomName}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/rooms/${roomId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Błąd usuwania pokoju');
      setSuccessMsg(`Pokój "${roomName}" został usunięty.`);
      window.dispatchEvent(new CustomEvent('rooms_updated'));
      await fetchRooms();
    } catch (err: any) {
      setError(err.message || 'Nie udało się usunąć pokoju.');
    }
  };

  const handleQuickPriceChange = async (roomId: string, newPrice: number) => {
    try {
      const res = await adminFetch(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrice: newPrice }),
      });
      if (res.ok) {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, basePrice: newPrice } : r));
        setSuccessMsg(`Cena została zaktualizowana.`);
        window.dispatchEvent(new CustomEvent('rooms_updated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">{adminText(lang, 'Zarządzanie Pokojami i Cenami')}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 rounded-full">
              {adminText(lang, 'Baza Centralna PostgreSQL')}
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            {adminText(lang, 'Jedyna centralna tabela pokoi w aplikacji. Wszelkie zmiany cen i opisów są natychmiast widoczne dla gości w ofercie, kalendarzu i rezerwacjach.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRooms}
            disabled={isLoading}
            className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            title={adminText(lang, 'Odśwież listę pokoi')}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            {adminText(lang, 'Dodaj Nowy Pokój')}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">✕</button>
        </div>
      )}

      {/* Rooms List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-700/40 transition-all"
          >
            <div>
              {/* Photo preview carousel/thumbnails */}
              <div className="relative h-48 bg-stone-100 overflow-hidden group">
                <img
                  src={room.images[0] || '/images/image-22.jpg'}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-stone-900/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
                    {adminText(lang, room.category === 'double' ? 'Pokój 2-osobowy' : room.category === 'family' ? 'Pokój Rodzinny' : 'Apartament Deluxe')}
                  </span>
                  {room.active === false && (
                    <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">
                      {adminText(lang, 'Ukryty')}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-amber-800 text-white font-bold text-sm rounded-lg shadow">
                  {room.basePrice} zł <span className="text-xs font-normal">{adminText(lang, '/ noc')}</span>
                </div>
              </div>

              {/* Room details */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-stone-900 leading-tight">{room.name}</h3>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-stone-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-amber-800" />
                    {adminText(lang, 'Do')} {room.capacity} {adminText(lang, 'osób')}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Maximize2 className="w-4 h-4 text-amber-800" />
                    {room.size}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Bed className="w-4 h-4 text-amber-800" />
                    {room.bedConfig}
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">{room.description}</p>

                {/* Amenities / Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {room.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-md border border-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {room.tags.length > 4 && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 text-xs rounded-md font-medium">
                      +{room.tags.length - 4} {adminText(lang, 'więcej')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions and Quick Price Input */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-stone-600">{adminText(lang, 'Szybka zmiana ceny:')}</label>
                <div className="relative w-24">
                  <input
                    type="number"
                    defaultValue={room.basePrice}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0 && val !== room.basePrice) {
                        handleQuickPriceChange(room.id, val);
                      }
                    }}
                    className="w-full pl-2 pr-6 py-1 text-xs font-bold text-stone-900 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-700"
                  />
                  <span className="absolute right-2 top-1 text-xs text-stone-500">zł</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(room)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-2xs transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-stone-600" />
                  {adminText(lang, 'Edytuj')}
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.name)}
                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                  title={adminText(lang, 'Usuń pokój')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit / Create Room */}
      {(isCreating || editingRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="text-xl font-bold text-stone-900">
                {isCreating ? adminText(lang, 'Dodaj Nowy Pokój do Bazy') : `${adminText(lang, 'Edycja Pokoju: ')}${editingRoom?.name}`}
              </h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-700 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Nazwa Pokoju / Apartamentu *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={adminText(lang, 'np. Pokój 2-osobowy Comfort z Balkonem')}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Kategoria')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  >
                    <option value="double">{adminText(lang, 'Pokój 2-osobowy (Double)')}</option>
                    <option value="family">{adminText(lang, 'Pokój Rodzinny / Studio')}</option>
                    <option value="suite">{adminText(lang, 'Apartament Górski Deluxe')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Cena Podstawowa (zł / doba) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Maksymalna Liczba Osób')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Metraż (Powierzchnia)')}
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="np. 22 m²"
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Konfiguracja Łóżek')}
                  </label>
                  <input
                    type="text"
                    value={bedConfig}
                    onChange={(e) => setBedConfig(e.target.value)}
                    placeholder={adminText(lang, 'np. 1 łoże małżeńskie King-Size lub 2 łóżka pojedyncze')}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Zdjęcia (URL ścieżki, po jednym w każdej linii)')}
                  </label>
                  <textarea
                    rows={3}
                    value={imagesText}
                    onChange={(e) => setImagesText(e.target.value)}
                    placeholder="/images/image-22.jpg&#10;/images/image-23.jpg"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    {adminText(lang, 'Wskazówka: Używaj ścieżek z katalogu /images/ (np. /images/image-22.jpg, /images/image-23.jpg, /images/image-24.jpg, /images/image-25.jpg).')}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Udogodnienia i Etykiety (oddzielone przecinkami)')}
                  </label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder={adminText(lang, 'Śniadanie w cenie, Prywatna łazienka, TV LED, Balkon z widokiem, Wi-Fi')}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    {adminText(lang, 'Opis Pokoju dla Gości')}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={adminText(lang, 'Opisz atmosferę, wykończenie w drewnie, widoki z okna i wyposażenie...')}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 text-amber-800 rounded focus:ring-amber-700"
                    />
                    {adminText(lang, 'Pokój aktywny i dostępny do rezerwacji online')}
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
                >
                  {adminText(lang, 'Anuluj')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl shadow transition-colors"
                >
                  {adminText(lang, isCreating ? 'Zapisz Pokój w Bazie' : 'Zapisz Zmiany')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
