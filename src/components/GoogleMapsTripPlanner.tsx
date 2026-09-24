import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Car,
  Compass,
  Clock,
  Route as RouteIcon,
  Search,
  CheckCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
  ArrowRight,
  X,
  LocateFixed,
  Building2,
  Home,
  Layers,
  Eye
} from 'lucide-react';
import { TripDetails, AddressSuggestion, Language } from '../types';
import { translations } from '../translations';

interface GoogleMapsTripPlannerProps {
  lang?: Language;
}

const HOTEL_NAME = "Watra Korbielów";
const HOTEL_ADDRESS = "ul. Graniczna 17, 34-335 Korbielów";
const HOTEL_LAT_LON = "49.5702,19.3524";

const POPULAR_ORIGINS = [
  "Katowice",
  "Kraków",
  "Bielsko-Biała",
  "Warszawa",
  "Żywiec",
  "Wrocław",
  "Soblówka",
  "Zawoja",
  "Žilina (SK)",
  "Namestovo (SK)"
];

export const GoogleMapsTripPlanner: React.FC<GoogleMapsTripPlannerProps> = ({ lang = 'pl' }) => {
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [originInput, setOriginInput] = useState('');
  const [activeRouteOrigin, setActiveRouteOrigin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  // Autocomplete / suggestions state
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced address search autocomplete
  useEffect(() => {
    const trimmed = originInput.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.startsWith('Moja lokalizacja (')) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const res = await fetch(`/api/directions/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            setHighlightedIndex(-1);
          }
        }
      } catch (err) {
        console.warn('Suggest fetch error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [originInput]);

  // Calculate route with our multi-tier geocoder & directions engine
  const handleCalculateRoute = async (targetOrigin?: string, coords?: [number, number]) => {
    const query = (targetOrigin !== undefined ? targetOrigin : originInput).trim();
    if (!query && !coords) {
      setError('Wpisz dowolne miasto, wieś lub dokładny adres (np. Katowice, Kraków, Soblówka 50, Podleśna 24 Krzeszowice).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      let url = `/api/directions?origin=${encodeURIComponent(query || 'Lokalizacja początkowa')}`;
      if (coords && coords.length === 2) {
        url += `&lat=${coords[0]}&lon=${coords[1]}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się obliczyć trasy.');
      }

      setTripDetails(data);
      setActiveRouteOrigin(query);
      setShowSteps(false);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wyszukiwania trasy.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setOriginInput(suggestion.fullAddress || suggestion.label);
    setShowSuggestions(false);
    handleCalculateRoute(suggestion.fullAddress || suggestion.label, [suggestion.lat, suggestion.lon]);
  };

  const handlePresetClick = (city: string) => {
    setOriginInput(city);
    setShowSuggestions(false);
    handleCalculateRoute(city);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Twoja przeglądarka nie obsługuje geolokalizacji GPS.');
      return;
    }

    setIsLocatingUser(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const label = `Moja lokalizacja (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
        setOriginInput(label);
        setShowSuggestions(false);
        handleCalculateRoute(label, [lat, lon]);
      },
      () => {
        setIsLocatingUser(false);
        setError('Nie udało się pobrać pozycji GPS. Wpisz nazwę swojej miejscowości ręcznie.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Construct Google Maps embed URL
  const getGoogleMapsEmbedUrl = () => {
    const typeParam = mapType === 'satellite' ? '&t=k' : '';
    if (activeRouteOrigin) {
      // Directions embed
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(activeRouteOrigin)}&daddr=${encodeURIComponent(`${HOTEL_NAME}, ${HOTEL_ADDRESS}`)}&output=embed${typeParam}`;
    }
    // Location embed
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${HOTEL_NAME} ${HOTEL_ADDRESS}`)}&z=15&output=embed${typeParam}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden" id="google-maps-trip-planner">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-[#1E3A2B] text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center space-x-2 bg-[#D4A373]/20 text-[#D4A373] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Google Maps • Precyzyjny Planer Dojazdu</span>
          </div>

          {/* Map Layer Switcher */}
          <div className="flex items-center space-x-1.5 bg-black/25 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-white/70 px-2 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#D4A373]" />
              {t.tripPlanner.tag}:
            </span>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-[#D4A373] text-[#1E3A2B] font-bold shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.tripPlanner.roadmap}
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-[#D4A373] text-[#1E3A2B] font-bold shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.tripPlanner.satellite}
            </button>
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
          {t.tripPlanner.title}
        </h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
          {t.tripPlanner.subtitle}
        </p>
      </div>

      {/* Input Planner Bar with Autocomplete */}
      <div className="p-6 sm:p-8 bg-[#F9F8F6] border-b border-neutral-200 space-y-4">
        <div ref={inputContainerRef} className="relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                handleSelectSuggestion(suggestions[highlightedIndex]);
              } else {
                handleCalculateRoute();
              }
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <MapPin className="w-4 h-4 text-[#C86D51]" />
              </div>
              <input
                type="text"
                id="trip-planner-origin-input"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t.tripPlanner.placeholder}
                autoComplete="off"
                className="w-full pl-10 pr-20 py-3.5 bg-white border border-neutral-300 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A2B] focus:border-transparent transition-all shadow-xs"
              />

              {/* Clear button & Loading indicator inside input */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
                {isSearchingSuggestions && (
                  <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-[#1E3A2B] rounded-full animate-spin mr-1" />
                )}
                {originInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginInput('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Wyczyść"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocatingUser}
                  className="p-1.5 text-[#1E3A2B] hover:text-[#C86D51] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title={t.tripPlanner.gpsLocating}
                >
                  <LocateFixed className={`w-4 h-4 ${isLocatingUser ? 'animate-pulse text-[#C86D51]' : ''}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="calculate-trip-btn"
              className="w-full sm:w-auto shrink-0 bg-[#1E3A2B] hover:bg-[#2A4F3B] active:scale-[0.98] disabled:opacity-60 text-white px-7 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.tripPlanner.calculating}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-[#D4A373]" />
                  <span>{t.tripPlanner.calculateRoute}</span>
                </span>
              )}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-80 overflow-y-auto">
              <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-100 text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
                <span>{t.tripPlanner.matchedAddresses}</span>
                <span className="text-[10px] text-neutral-400 font-normal">{t.tripPlanner.selectOrEnter}</span>
              </div>
              <ul className="divide-y divide-neutral-100">
                {suggestions.map((item, idx) => (
                  <li key={`${item.fullAddress}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full px-4 py-3 text-left flex items-start space-x-3 transition-colors cursor-pointer ${
                        highlightedIndex === idx ? 'bg-emerald-50 text-[#1E3A2B]' : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 text-neutral-400">
                        {item.type === 'house' || item.type === 'building' ? (
                          <Home className="w-4 h-4 text-[#C86D51]" />
                        ) : (
                          <Building2 className="w-4 h-4 text-[#1E3A2B]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.type === 'house' && (
                            <span className="inline-block text-[9px] font-bold bg-[#C86D51]/15 text-[#C86D51] px-1.5 py-0.2 rounded">
                              {t.tripPlanner.propertyNumber}
                            </span>
                          )}
                        </div>
                        {item.secondaryText && (
                          <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {item.secondaryText}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-neutral-300 self-center">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Click Popular Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-neutral-500 mr-1 flex items-center">
            {t.tripPlanner.samplePoints}
          </span>
          {POPULAR_ORIGINS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handlePresetClick(city)}
              className="text-[11px] font-medium bg-white hover:bg-[#1E3A2B] hover:text-white text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center space-x-2.5 text-xs text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-2xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </div>

      {/* Embedded Google Maps Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-neutral-100">
        <iframe
          title="Google Maps Watra Korbielów"
          src={getGoogleMapsEmbedUrl()}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/80 shadow-sm text-[11px] text-neutral-700 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#1E3A2B]">Google Maps</span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-500">{activeRouteOrigin ? `Trasa: ${activeRouteOrigin}` : 'Watra Korbielów'}</span>
        </div>

        {/* Live Location Badge */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200 shadow-lg text-xs max-w-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#1E3A2B]">Watra Korbielów Resort</span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-1">
            {HOTEL_ADDRESS}
          </p>
          <div className="text-[10px] text-neutral-400 mt-0.5">
            100 m do stoku Cypisek • 1557 m n.p.m. Pilsko
          </div>
        </div>
      </div>

      {/* Calculated Trip Results Card */}
      {tripDetails && (
        <div className="p-6 sm:p-8 bg-white border-t border-neutral-200 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F9F8F6] p-5 rounded-2xl border border-neutral-200">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.tripPlanner.routeLabel}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1E3A2B]">
                {tripDetails.verifiedAddress || tripDetails.originFullName || tripDetails.originName}
              </div>
              {tripDetails.isApproximate && tripDetails.approximateNote && (
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-block">
                  ℹ {tripDetails.approximateNote}
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-4 mt-2 pt-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1E3A2B]">
                    {tripDetails.distanceKm}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500">{t.tripPlanner.distanceUnit}</span>
                </div>
                <div className="text-neutral-300 hidden sm:inline">•</div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#C86D51]">
                    {tripDetails.durationText}
                  </span>
                  <span className="text-xs text-neutral-500">{t.tripPlanner.byCar}</span>
                </div>
              </div>
            </div>

            {/* External Navigation Links */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(tripDetails.originFullName || tripDetails.originName)}&destination=Watra+Korbiel%C3%B3w+ul.+Graniczna+17+34-335+Korbiel%C3%B3w`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>{t.tripPlanner.openGoogleMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setActiveRouteOrigin(null);
                  setTripDetails(null);
                  setOriginInput('');
                }}
                className="bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.tripPlanner.resetMap}
              </button>
            </div>
          </div>

          {/* Toggle Turn-by-Turn Steps */}
          {tripDetails.steps && tripDetails.steps.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                className="text-xs font-bold text-[#1E3A2B] hover:text-[#C86D51] flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <RouteIcon className="w-4 h-4 text-[#D4A373]" />
                <span>
                  {showSteps ? t.tripPlanner.hideSteps : t.tripPlanner.showSteps(tripDetails.steps.length)}
                </span>
              </button>

              {showSteps && (
                <div className="space-y-2 bg-[#F9F8F6] p-4 rounded-2xl border border-neutral-200 max-h-72 overflow-y-auto">
                  {tripDetails.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between py-2 border-b border-neutral-200/60 last:border-0 text-xs"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-white border border-neutral-300 text-neutral-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-neutral-800 font-medium leading-relaxed">
                          {step.instruction}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-3 text-neutral-500 font-mono text-[11px]">
                        {step.distance}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsTripPlanner;
