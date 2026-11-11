import React, { useState, useEffect, useRef } from 'react';
import { Map, Marker, Popup, LngLatBounds, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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
  Layers
} from 'lucide-react';
import { TripDetails, AddressSuggestion, Language } from '../types';

interface OpenFreeMapTripPlannerProps {
  lang: Language;
}

// Watra Korbielów coordinates: [longitude, latitude] for MapLibre GL
const HOTEL_LNG_LAT: [number, number] = [19.3524, 49.5702];
const HOTEL_ADDRESS = "ul. Graniczna 17, 34-335 Korbielów";

// Available OpenFreeMap Vector Tile Styles
const OPEN_FREE_MAP_STYLES = [
  { id: 'liberty', name: 'OpenFreeMap Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'bright', name: 'OpenFreeMap Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'positron', name: 'OpenFreeMap Positron', url: 'https://tiles.openfreemap.org/styles/positron' }
];

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

export const OpenFreeMapTripPlanner: React.FC<OpenFreeMapTripPlannerProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const hotelMarkerRef = useRef<Marker | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const [currentStyle, setCurrentStyle] = useState<string>('liberty');
  const [originInput, setOriginInput] = useState('');
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

  // Initialize MapLibre GL with OpenFreeMap vector tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const styleUrl = OPEN_FREE_MAP_STYLES.find(s => s.id === currentStyle)?.url || OPEN_FREE_MAP_STYLES[0].url;

    const map = new Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: HOTEL_LNG_LAT,
      zoom: 13.5,
      pitch: 25, // Subtle 3D perspective angle
      bearing: 0,
      cooperativeGestures: true
    });

    // Add navigation controls (zoom, pitch, compass)
    map.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

    map.on('load', () => {
      // Custom Watra Korbielów Resort HTML Pin
      const el = document.createElement('div');
      el.className = 'watra-maplibre-hotel-pin';
      el.innerHTML = `
        <div style="cursor: pointer; position: relative;">
          <div style="position: absolute; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); width: 56px; height: 56px; background: rgba(30,58,43,0.2); border-radius: 9999px; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; background: #1E3A2B; color: #D4A373; border: 2.5px solid #D4A373; border-radius: 9999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.35); font-size: 20px;">
            🏔️
          </div>
        </div>
      `;

      const popup = new Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family: inherit; min-width: 220px; padding: 6px;">
          <div style="display: inline-block; background: #1E3A2B; color: #D4A373; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px;">
            Watra Korbielów Resort
          </div>
          <h3 style="font-weight: bold; color: #1E3A2B; font-size: 15px; margin: 0 0 3px 0;">Watra Korbielów</h3>
          <p style="font-size: 12px; color: #444; margin: 0 0 6px 0;">${HOTEL_ADDRESS}</p>
          <p style="font-size: 11px; color: #666; margin: 0;">100 m do wyciągu narciarskiego Cypisek • 3 km od granicy ze Słowacją</p>
        </div>
      `);

      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat(HOTEL_LNG_LAT)
        .setPopup(popup)
        .addTo(map);

      hotelMarkerRef.current = marker;
      popup.addTo(map);
    });

    mapInstanceRef.current = map;

    // Resize observer to ensure proper dimensions on container changes
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch OpenFreeMap style (Liberty, Bright, Positron)
  const handleStyleChange = (styleId: string) => {
    setCurrentStyle(styleId);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const styleObj = OPEN_FREE_MAP_STYLES.find(s => s.id === styleId);
    if (styleObj) {
      map.setStyle(styleObj.url);
      // Re-draw route if present once style finishes reloading
      map.once('style.load', () => {
        if (tripDetails) {
          drawRouteOnMap(tripDetails);
        }
      });
    }
  };

  // Draw GeoJSON route line on MapLibre GL
  const drawRouteOnMap = (details: TripDetails) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old route layers if existing
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getLayer('route-casing')) map.removeLayer('route-casing');
    if (map.getSource('route-source')) map.removeSource('route-source');

    // Remove old origin marker
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    // Origin coords: details.originCoords is [lat, lon]
    const originLngLat: [number, number] = [details.originCoords[1], details.originCoords[0]];

    // Create custom Car marker for origin
    const originEl = document.createElement('div');
    originEl.className = 'watra-origin-pin';
    originEl.innerHTML = `
      <div style="background-color: #C86D51; color: white; border: 2.5px solid white; border-radius: 9999px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.35); font-size: 19px; cursor: pointer;">
        🚗
      </div>
    `;

    const originPopup = new Popup({ offset: 22, closeButton: false }).setHTML(`
      <div style="font-family: inherit; min-width: 180px; padding: 4px;">
        <strong style="color: #C86D51; font-size: 11px; text-transform: uppercase;">Początek trasy:</strong><br/>
        <div style="font-weight: bold; color: #1E3A2B; font-size: 13px; margin-top: 2px;">
          ${details.originFullName || details.originName}
        </div>
      </div>
    `);

    const originMarker = new Marker({ element: originEl, anchor: 'center' })
      .setLngLat(originLngLat)
      .setPopup(originPopup)
      .addTo(map);

    originMarkerRef.current = originMarker;

    // Build GeoJSON coordinate array [lng, lat]
    // Server sends geometry as [lat, lon] array
    const coordinates: [number, number][] = details.geometry.map(pt => [pt[1], pt[0]]);

    if (coordinates.length > 0) {
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });

      // White casing for high contrast on any background
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 8,
          'line-opacity': 0.85
        }
      });

      // Main route line in brand terracotta/coral
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#C86D51',
          'line-width': 5,
          'line-opacity': 0.95
        }
      });

      // Fit map bounds to show full route
      const bounds = new LngLatBounds();
      bounds.extend(originLngLat);
      bounds.extend(HOTEL_LNG_LAT);
      coordinates.forEach(c => bounds.extend(c));

      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15,
        duration: 1200
      });
    }
  };

  // Calculate route with our robust multi-tier geocoder
  const handleCalculateRoute = async (targetOrigin?: string, coords?: [number, number]) => {
    const query = (targetOrigin !== undefined ? targetOrigin : originInput).trim();
    if (!query && !coords) {
      setError('Wpisz dowolne miasto, wieś lub dokładny adres (np. Katowice, Soblówka 50, Podleśna 24 Krzeszowice).');
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
      setShowSteps(false);
      drawRouteOnMap(data);
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
      (geoErr) => {
        setIsLocatingUser(false);
        setError('Nie udało się pobrać pozycji GPS. Wpisz nazwę swojej miejscowości lub wioski ręcznie.');
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

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden" id="openfreemap-trip-planner">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-[#1E3A2B] text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center space-x-2 bg-[#D4A373]/20 text-[#D4A373] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>OpenFreeMap • Wektorowa Mapa & Planer Dojazdu</span>
          </div>
          
          {/* Map style switcher */}
          <div className="flex items-center space-x-1.5 bg-black/25 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-white/70 px-2 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#D4A373]" />
              Styl:
            </span>
            {OPEN_FREE_MAP_STYLES.map(style => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleChange(style.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currentStyle === style.id
                    ? 'bg-[#D4A373] text-[#1E3A2B] font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {style.id.charAt(0).toUpperCase() + style.id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
          Lokalizacja Watra Korbielów & Zaplanuj Trasę
        </h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
          Wpisz <strong>dowolny adres w Polsce lub Europie</strong> — od wielkich metropolii po najmniejsze górskie wioski, osady i numery posesji (np. <em>Podesna 24, Krzeszowice</em>, <em>Soblówka 50</em>, <em>Krzyżówki</em>).
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
                placeholder="Wpisz dowolny adres, miejscowość lub wioskę (np. Podesna 24 Krzeszowice, Soblówka 50, Katowice...)"
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
                  title="Użyj mojej lokalizacji GPS"
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
                  <span>Wyznaczanie trasy...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-[#D4A373]" />
                  <span>Wyznacz Trasę</span>
                </span>
              )}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-80 overflow-y-auto">
              <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-100 text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
                <span>Dopasowane adresy i miejscowości</span>
                <span className="text-[10px] text-neutral-400 font-normal">Wybierz lub naciśnij Enter</span>
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
                              numer posesji
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
            Przykładowe punkty:
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

      {/* Map Canvas Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          id="openfreemap-container"
          className="w-full h-96 sm:h-[480px] z-10 bg-neutral-100"
        />

        {/* OpenFreeMap Attribution & Status Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/80 shadow-sm text-[11px] text-neutral-700 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#1E3A2B]">OpenFreeMap Vector Tiles</span>
          <span className="text-neutral-400">•</span>
          <a
            href="https://openfreemap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-[#1E3A2B] underline"
          >
            openfreemap.org
          </a>
        </div>

        {/* Live Hotel Location Badge Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200 shadow-lg text-xs max-w-xs pointer-events-auto">
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
                <span>Wyznaczona trasa dojazdu:</span>
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
                  <span className="text-sm font-semibold text-neutral-500">km</span>
                </div>
                <div className="text-neutral-300 hidden sm:inline">•</div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#C86D51]">
                    {tripDetails.durationText}
                  </span>
                  <span className="text-xs text-neutral-500">samochodem</span>
                </div>
              </div>
            </div>

            {/* External Navigation Links */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(tripDetails.originFullName || tripDetails.originName)}&destination=Watra+Korbielów+ul.+Graniczna+17+34-335+Korbielów`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Nawiguj w Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://openfreemap.org`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>OpenFreeMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
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
                  {showSteps ? 'Ukryj szczegółowy plan manewrów' : `Pokaż kluczowe wskazówki dojazdu (${tripDetails.steps.length} kroków)`}
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
