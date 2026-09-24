import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, ChevronRight, Snowflake, Sun, Thermometer, Wind, Play, X, CalendarDays, CloudSun, Cloud, CloudRain, CloudLightning, Droplets, ChevronDown, Tag } from 'lucide-react';
import { Language, BookingSearchQuery, WeatherData, PromotionalCampaign } from '../types';
import { translations } from '../translations';
import { BookingBar } from './BookingBar';
import { SocialShareBar } from './SocialShareBar';

interface HeroProps {
  lang: Language;
  onSearch: (query: BookingSearchQuery) => void;
  onOpenBooking: () => void;
  onOpenAvailabilityModal?: () => void;
  activeCampaign?: PromotionalCampaign | null;
  campaignsCount?: number;
  onNavigateToPackages?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onSearch,
  onOpenBooking,
  onOpenAvailabilityModal,
  activeCampaign,
  campaignsCount = 0,
  onNavigateToPackages
}) => {
  const [activeSeasonView, setActiveSeasonView] = useState<'winter' | 'summer'>('winter');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasPrewarmedVideo, setHasPrewarmedVideo] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang];

  // Prewarm YouTube embed connection when user hovers over the button or after mount
  const handlePrewarmVideo = () => {
    if (hasPrewarmedVideo) return;
    setHasPrewarmedVideo(true);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'document';
    link.href = 'https://www.youtube.com/embed/jz_KmBaEq1w?autoplay=1&playsinline=1&rel=0';
    document.head.appendChild(link);
  };

  const handleOpenVideoModal = () => {
    handlePrewarmVideo();
    setIsVideoLoading(true);
    setIsVideoModalOpen(true);
    // Safety auto-dismiss loader after 800ms so controls and playback are never blocked
    setTimeout(() => {
      setIsVideoLoading(false);
    }, 800);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsForecastOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsForecastOpen(false);
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const getWeatherIcon = (code?: number, className = "w-4 h-4") => {
    if (code === undefined || code === 0) return <Sun className={`${className} text-amber-400`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${className} text-amber-300`} />;
    if (code === 3) return <Cloud className={`${className} text-neutral-300`} />;
    if (code === 45 || code === 48) return <Cloud className={`${className} text-neutral-400`} />;
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return <CloudRain className={`${className} text-blue-400`} />;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <Snowflake className={`${className} text-sky-200`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-yellow-400`} />;
    return <CloudSun className={`${className} text-amber-300`} />;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
        setIsForecastOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen]);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(() => {
        // Fallback default
        setWeather({
          location: "Korbielów - Góra Pilsko (1557 m)",
          updatedAt: "Dzisiaj",
          baseValleyTemp: "+12°C",
          summitTemp: "+8°C",
          conditions: "Słonecznie z lekkim zachmurzeniem",
          weatherCode: 2,
          wind: "10 km/h",
          trailConditions: "Bardzo dobre, szlaki przetarte",
          dailyForecast: [
            { date: "2026-09-11", dayName: "Dziś", weatherCode: 2, conditions: "Słonecznie z lekkim zachmurzeniem", tempMax: "+14°C", tempMin: "+7°C", precipProbability: 10, windSpeed: "10 km/h", summitTempEst: "+2°C / +8°C" },
            { date: "2026-09-12", dayName: "Jutro", weatherCode: 1, conditions: "Głównie słonecznie", tempMax: "+16°C", tempMin: "+8°C", precipProbability: 5, windSpeed: "8 km/h", summitTempEst: "+4°C / +10°C" },
            { date: "2026-09-13", dayName: "Niedziela", weatherCode: 0, conditions: "Bezchmurnie, słonecznie", tempMax: "+17°C", tempMin: "+9°C", precipProbability: 0, windSpeed: "9 km/h", summitTempEst: "+5°C / +11°C" },
            { date: "2026-09-14", dayName: "Poniedziałek", weatherCode: 2, conditions: "Częściowe zachmurzenie", tempMax: "+15°C", tempMin: "+8°C", precipProbability: 20, windSpeed: "12 km/h", summitTempEst: "+3°C / +9°C" },
            { date: "2026-09-15", dayName: "Wtorek", weatherCode: 61, conditions: "Lekki deszcz", tempMax: "+12°C", tempMin: "+6°C", precipProbability: 60, windSpeed: "15 km/h", summitTempEst: "0°C / +6°C" },
            { date: "2026-09-16", dayName: "Środa", weatherCode: 3, conditions: "Pochmurno", tempMax: "+13°C", tempMin: "+7°C", precipProbability: 30, windSpeed: "11 km/h", summitTempEst: "+1°C / +7°C" },
            { date: "2026-09-17", dayName: "Czwartek", weatherCode: 1, conditions: "Głównie słonecznie", tempMax: "+16°C", tempMin: "+8°C", precipProbability: 15, windSpeed: "9 km/h", summitTempEst: "+3°C / +10°C" }
          ],
          skiLiftsStatus: {
            pilskoMain: "Gotowy",
            cypisekBeginner: "Czynny w sezonie",
            andiamoBeginner: "Czynny w sezonie"
          }
        });
      });
  }, []);

  // Swapped images per user request: Winter gets about.jpg, Summer gets banner-1.jpg
  const heroImages = {
    winter: "/images/about.jpg",
    summer: "/images/banner-1.jpg",
  };

  return (
    <section id="hero-section" className="relative pt-6 pb-20 md:pb-28 overflow-hidden">
      {/* Background Image Container with Crossfade */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImages[activeSeasonView]}
          alt={activeSeasonView === 'winter' ? 'Zimowy stok Korbielów' : 'Letni krajobraz Pilska'}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700 brightness-[0.78]"
        />
        {/* Gradients to ensure text contrast and aesthetic integration with dark green background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14281E] via-[#14281E]/60 to-[#14281E]" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#14281E]/40 to-[#14281E]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-12">
        {/* Top bar: Season view switcher & live weather ticker */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          {/* Season View Toggle */}
          <div className="inline-flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/15 text-xs text-white">
            <button
              onClick={() => setActiveSeasonView('winter')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSeasonView === 'winter'
                  ? 'bg-blue-600/80 text-white font-bold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>{t.hero.winterMode}</span>
            </button>
            <button
              onClick={() => setActiveSeasonView('summer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeSeasonView === 'summer'
                  ? 'bg-amber-600/80 text-white font-bold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.hero.summerMode}</span>
            </button>
          </div>

          {/* Mountain Weather Badge with Interactive Hover Pop-up for 7-Day Forecast */}
          {weather && (
            <div className="relative">
              <div
                id="hero-weather-badge"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsForecastOpen(prev => !prev)}
                className="group flex items-center space-x-3 bg-[#14281E]/90 hover:bg-[#14281E] backdrop-blur-md border border-white/20 hover:border-[#D4A373]/60 px-4 py-2 rounded-full text-xs text-white shadow-lg cursor-pointer transition-all duration-200 select-none"
                title="Najedź kursor lub kliknij, aby zobaczyć prognozę 7-dniową"
              >
                <span className="flex items-center space-x-1.5 text-[#D4A373] font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-[#D4A373] animate-pulse" />
                  <span>Pilsko: {weather.summitTemp}</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/90 hidden sm:inline">{weather.conditions}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-medium hidden md:inline">
                  Dolina: {weather.baseValleyTemp}
                </span>
                <span className="text-[10px] text-white/50 group-hover:text-[#D4A373] ml-1 flex items-center transition-colors">
                  <ChevronDown className={`w-3 h-3 transition-transform ${isForecastOpen ? 'rotate-180 text-[#D4A373]' : ''}`} />
                </span>
              </div>

              {/* 7-Day Forecast Pop-up */}
              {isForecastOpen && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md bg-[#14281E]/95 backdrop-blur-xl border border-[#D4A373]/50 rounded-3xl p-4 sm:p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 text-white space-y-3.5"
                >
                  {/* Pop-up Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373]">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#F9F8F6]">
                          {t.heroExtra?.forecastTitle || 'Prognoza 7-dniowa • Pilsko & Korbielów'}
                        </h4>
                        <p className="text-[10px] text-white/70">
                          {t.heroExtra?.forecastLive || 'Aktualizowane na żywo • Open-Meteo API'} ({weather.updatedAt})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{t.common.live}</span>
                    </div>
                  </div>

                  {/* Current Summit vs Valley Live Strip */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-black/35 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#D4A373] uppercase font-bold tracking-wider block">
                          {t.heroExtra?.pilskoPeak || 'Szczyt Pilsko (1557 m)'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-white font-mono">{weather.summitTemp}</span>
                      </div>
                      <div className="text-right text-[11px] text-white/70">
                        <span className="flex items-center justify-end space-x-1">
                          <Wind className="w-3 h-3 text-sky-300" />
                          <span>{weather.wind}</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/35 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                          {t.heroExtra?.watraValley || 'Dolina Watra (~650 m)'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-white font-mono">{weather.baseValleyTemp}</span>
                      </div>
                      <div className="text-right text-[11px] text-white/70">
                        <span className="flex items-center justify-end space-x-1">
                          <Droplets className="w-3 h-3 text-blue-300" />
                          <span>{weather.humidity || "72%"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Day-by-Day Forecast Rows */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {weather.dailyForecast && weather.dailyForecast.length > 0 ? (
                      weather.dailyForecast.map((day, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs transition-colors ${
                            idx === 0
                              ? 'bg-white/15 border border-[#D4A373]/50'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {/* Day name & icon */}
                          <div className="flex items-center space-x-2.5 w-32 sm:w-36 shrink-0">
                            {getWeatherIcon(day.weatherCode, "w-4 h-4")}
                            <div>
                              <span className="font-bold text-white block leading-tight">
                                {day.dayName}
                              </span>
                              <span className="text-[10px] text-white/60 truncate block max-w-[95px] sm:max-w-[110px]">
                                {day.conditions}
                              </span>
                            </div>
                          </div>

                          {/* Precip probability */}
                          <div className="flex items-center space-x-1 text-[11px] text-sky-300 w-14 shrink-0">
                            <Droplets className="w-3 h-3" />
                            <span>{day.precipProbability}%</span>
                          </div>

                          {/* Valley High/Low Temp */}
                          <div className="text-right font-mono font-semibold text-xs">
                            <span className="text-white">{day.tempMax}</span>
                            <span className="text-white/40 mx-1">/</span>
                            <span className="text-white/70">{day.tempMin}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-white/60">
                        Ładowanie szczegółowej prognozy tygodniowej...
                      </div>
                    )}
                  </div>

                  {/* Alpine conditions footer tip */}
                  <div className="pt-2 border-t border-white/10 flex items-start space-x-2 text-[11px] text-white/80">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A373] shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      {weather.trailConditions} • Wyciągi Cypisek (100 m) i Andiamo (120 m) tuż przy obiekcie.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Hero Content */}
        <div className="max-w-3xl text-left text-white space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/50 text-[#D4A373] text-xs uppercase tracking-widest font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{t.hero.tag}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F9F8F6] leading-[1.15] drop-shadow-md">
            {t.hero.headline}
          </h1>

          <p className="text-base sm:text-lg text-[#F9F8F6]/90 max-w-2xl leading-relaxed font-light drop-shadow">
            {t.hero.subheadline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenAvailabilityModal ? onOpenAvailabilityModal() : onOpenBooking()}
              id="hero-availability-btn"
              className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-xl flex items-center space-x-2 transition-all transform active:scale-95 cursor-pointer uppercase"
            >
              <span>{t.hero.ctaAvailability}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenVideoModal}
              onMouseEnter={handlePrewarmVideo}
              onFocus={handlePrewarmVideo}
              id="hero-explore-resort-btn"
              className="bg-white/15 hover:bg-white/25 text-[#F9F8F6] border border-white/25 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide backdrop-blur-sm flex items-center space-x-2.5 transition-all cursor-pointer group"
              title="Oglądaj film z resortu Watra Korbielów"
            >
              <div className="w-5 h-5 rounded-full bg-[#D4A373] text-[#14281E] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>{t.hero.ctaExplore}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Booking Search Bar with Sprawdź Dostępność */}
      <div className="mt-4 sm:mt-8">
        <BookingBar
          lang={lang}
          onSearch={onSearch}
          onOpenAvailabilityModal={onOpenAvailabilityModal || onOpenBooking}
        />
      </div>

      {/* Promotional Campaign Banner - Relocated below Sprawdź Dostępność buttons right above Reservation section */}
      {activeCampaign && (
        <div id="hero-promotional-banner" className="mt-4 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-[#14281E]/95 hover:bg-[#14281E] border border-[#D4A373]/50 backdrop-blur-md rounded-2xl sm:rounded-full px-4 py-2 sm:py-2 text-white shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Side: Badge + Title + Promo Code */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden w-full sm:w-auto">
              <div className="bg-[#D4A373] text-[#14281E] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center space-x-1 shadow-xs">
                <Tag className="w-3 h-3 shrink-0" />
                <span>{activeCampaign.badge}</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#F9F8F6] truncate">
                {activeCampaign.title}
              </span>
              <span className="hidden md:inline text-white/30">•</span>
              <span className="hidden md:inline text-xs text-white/80">
                {t.heroExtra?.promoCodeLabel || 'Kod rabatowy:'} <strong className="font-mono text-[#D4A373] bg-black/40 px-2 py-0.5 rounded border border-white/10">{activeCampaign.promoCode}</strong>
              </span>
            </div>

            {/* Right Side: Social Share + Actions */}
            <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
              <SocialShareBar campaign={activeCampaign} variant="compact" />
              {campaignsCount > 1 && onNavigateToPackages && (
                <button
                  onClick={onNavigateToPackages}
                  className="text-xs text-white/80 hover:text-white underline decoration-white/40 cursor-pointer hidden sm:inline"
                >
                  {t.heroExtra?.allCampaigns ? t.heroExtra.allCampaigns(campaignsCount) : `Wszystkie (${campaignsCount})`}
                </button>
              )}
              <button
                onClick={onOpenBooking}
                className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 uppercase tracking-wide"
              >
                {t.heroExtra?.bookPromoBtn || 'Rezerwuj ze zniżką'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Page Video Modal for Exploring Resort */}
      {isVideoModalOpen && (
        <div
          id="explore-resort-video-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#14281E] rounded-3xl border border-[#D4A373]/40 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#2A4F3B] bg-[#1E3A2B]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#D4A373] text-[#14281E] flex items-center justify-center font-bold shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#F9F8F6]">
                    {t.heroExtra?.videoModalTitle || 'Watra Korbielów • Odkryj nasz resort'}
                  </h3>
                  <p className="text-xs text-[#D4A373]">
                    {t.heroExtra?.videoModalSubtitle || 'Beskid Żywiecki • Stok Pilsko 1557 m n.p.m.'}
                  </p>
                </div>
              </div>

              <button
                id="close-video-modal-btn"
                onClick={() => setIsVideoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Zamknij wideo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fast-Loading YouTube Video Container (16:9 ratio, direct stream) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {/* Instant High-Res Poster Preview so user never sees black void */}
              <img
                src="/images/banner-1.jpg"
                alt="Watra Resort Korbielów"
                className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[1px]"
              />

              {isVideoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#14281E]/80 backdrop-blur-xs z-10 text-white space-y-3">
                  <div className="w-10 h-10 border-3 border-[#D4A373]/30 border-t-[#D4A373] rounded-full animate-spin" />
                  <span className="text-xs text-[#D4A373] font-medium tracking-wide">
                    {t.heroExtra?.videoLoading || 'Ładowanie wideo resortu...'}
                  </span>
                </div>
              )}
              <iframe
                src="https://www.youtube.com/embed/jz_KmBaEq1w?autoplay=1&playsinline=1&rel=0"
                title="Watra Korbielów Resort"
                className="absolute inset-0 w-full h-full border-0 z-5"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="eager"
                onLoad={() => setIsVideoLoading(false)}
              />
            </div>

            {/* Video Modal Footer */}
            <div className="px-5 sm:px-6 py-4 bg-[#14281E] flex flex-wrap items-center justify-between gap-3 border-t border-[#2A4F3B]">
              <span className="text-xs text-white/70">
                {t.heroExtra?.videoModalPerks || 'Pokoje • Stoki narciarskie • Restauracja • Jacuzzi pod gwiazdami'}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    onOpenBooking();
                  }}
                  className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  {t.common.bookStayDiscount}
                </button>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-white/60 hover:text-white text-xs px-3 py-2 cursor-pointer transition-colors"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
