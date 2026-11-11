import React, { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Clock,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Shield,
  Wifi,
  Sparkles
} from 'lucide-react';
import { RealtimeAnalyticsData } from '../types';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<RealtimeAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/analytics/realtime');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch real-time analytics:', err);
    } finally {
      setIsLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 4000); // Polling every 4s for live feel
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    if (mins < 60) return `${mins}m ${remSecs > 0 ? remSecs + 's' : ''}`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  if (isLoading && !data) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#1E3A2B] animate-spin" />
        <p className="text-sm font-medium text-neutral-600">Pobieranie statystyk wizyt w czasie rzeczywistym...</p>
      </div>
    );
  }

  const activeVisitors = data?.activeVisitorsNow || 0;
  const totalViews = data?.totalPageViews || 0;
  const avgDuration = data?.avgSessionDurationSeconds || 0;
  const topPages = data?.topPages || [];
  const topLocations = data?.topLocations || [];
  const recentVisitors = data?.recentVisitors || [];
  const deviceBreakdown = data?.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 };
  const maxViews = Math.max(...topPages.map(p => p.views), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Live Header Bar */}
      <div className="bg-gradient-to-r from-[#14281E] to-[#1E3A2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#D4A373]/30">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#D4A373] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
              Live Real-Time Telemetry
            </span>
            <span className="text-xs text-neutral-300 hidden md:inline">
              Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F9F8F6]">
            Statystyki Odwiedzających w Czasie Rzeczywistym
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-2xl">
            Monitoruj na żywo ruch na stronie Watra Korbielów: aktywne sesje, najczęściej odwiedzane podstrony, spędzony czas oraz lokalizację i adresy IP gości.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              autoRefresh
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            <Wifi className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
            <span>{autoRefresh ? 'Autoodświeżanie: ON' : 'Autoodświeżanie: OFF'}</span>
          </button>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className="bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] font-bold px-4 py-2 rounded-full text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Odśwież</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Active Visitors */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Goście Na Żywo
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#14281E]">
              {activeVisitors}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              teraz na stronie
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Aktywne sesje w ciągu ostatnich 90 sekund
          </p>
        </div>

        {/* Card 2: Total Page Views */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Łączne Wyświetlenia
            </span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#14281E]">
              {totalViews}
            </span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center">
              odsłon stron
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Wszystkie wyświetlenia w aktualnym oknie analitycznym
          </p>
        </div>

        {/* Card 3: Avg Session Duration */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Średni Czas Wizyty
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#14281E]">
              {formatSeconds(avgDuration)}
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              zaangażowanie
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Średni łączny czas gościa spędzony w serwisie
          </p>
        </div>

        {/* Card 4: Devices Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Podział Urządzeń
            </span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-3 text-xs font-medium text-neutral-700">
            <div className="flex items-center space-x-1">
              <Monitor className="w-3.5 h-3.5 text-neutral-400" />
              <span>Desktop: <strong>{deviceBreakdown.desktop}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Mobile: <strong>{deviceBreakdown.mobile}</strong></span>
            </div>
          </div>
          <div className="mt-2 w-full bg-neutral-100 rounded-full h-2 flex overflow-hidden">
            {totalViews > 0 && (
              <>
                <div
                  className="bg-[#1E3A2B]"
                  style={{
                    width: `${Math.round((deviceBreakdown.desktop / Math.max(1, deviceBreakdown.desktop + deviceBreakdown.mobile)) * 100)}%`
                  }}
                  title="Desktop"
                />
                <div
                  className="bg-[#D4A373]"
                  style={{
                    width: `${Math.round((deviceBreakdown.mobile / Math.max(1, deviceBreakdown.desktop + deviceBreakdown.mobile)) * 100)}%`
                  }}
                  title="Mobile"
                />
              </>
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-neutral-400 font-medium">
            <span>Komputery</span>
            <span>Smartfony</span>
          </div>
        </div>
      </div>

      {/* Grid: Top Visited Pages & Geolocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Pages Visited & Time Spent (8 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14281E] flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#D4A373]" />
                <span>Najpopularniejsze Podstrony & Czas Wizyty</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Które strony goście odwiedzają najczęściej oraz ile czasu na nich spędzają
              </p>
            </div>
            <span className="text-xs font-bold text-[#1E3A2B] bg-[#1E3A2B]/10 px-2.5 py-1 rounded-full">
              {topPages.length} podstron
            </span>
          </div>

          <div className="space-y-3.5">
            {topPages.map((pg, idx) => {
              const widthPct = Math.round((pg.views / maxViews) * 100);
              return (
                <div
                  key={pg.page}
                  className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1.5">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-[11px] font-bold text-[#1E3A2B] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{pg.title}</span>
                      <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                        (#{pg.page})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-[#14281E]">{pg.views}</span>
                        <span className="text-neutral-400 text-[10px] ml-1">odsłon</span>
                      </div>
                      <div className="text-right pl-2 border-l border-neutral-200">
                        <span className="font-extrabold text-[#D4A373]">
                          {formatSeconds(pg.avgTimeSpentSeconds)}
                        </span>
                        <span className="text-neutral-400 text-[10px] ml-1">śr. czas</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-neutral-200/70 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1E3A2B] to-[#2A4F3B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, widthPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-1 text-[10px] text-neutral-400">
                    <span>Łączny czas gości na tej podstronie: {formatSeconds(pg.totalTimeSpentSeconds)}</span>
                    <span>{widthPct}% udziału</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Geolocation Breakdown & Origin Cities (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14281E] flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#1E3A2B]" />
                <span>Geolokalizacja Gości</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Pochodzenie gości wg miast i krajów
              </p>
            </div>
            <span className="text-xs font-bold text-[#D4A373] bg-[#D4A373]/15 px-2.5 py-1 rounded-full">
              {topLocations.length} lokacji
            </span>
          </div>

          <div className="space-y-3">
            {topLocations.map(loc => (
              <div
                key={`${loc.country}_${loc.city}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl shadow-2xs" role="img" aria-label={loc.country}>
                    {loc.flag}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800">
                      {loc.city}, {loc.country}
                    </h4>
                    <span className="text-[10px] text-neutral-400">
                      Kod kraju: {loc.countryCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#14281E] bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                    {loc.count} {loc.count === 1 ? 'wizyta' : 'wizyt'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 w-10 text-right">
                    {loc.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Kluczowe rynki turystyczne Korbielowa</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              Główny ruch turystyczny generują aglomeracja śląska (Katowice, Bielsko-Biała), Małopolska (Kraków) oraz turyści ze Słowacji (Žilina, Orava, 3 km od granicy).
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Active Visitor Stream (Table with IP addresses & detailed telemetry) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#14281E] flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#1E3A2B]" />
              <span>Aktywne Sesje i Adresy IP Odwiedzających</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Szczegółowa lista gości w czasie rzeczywistym z podglądem adresu IP, bieżącej strony i czasu spędzonego na każdej podstronie.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-600">
            <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{activeVisitors} aktywnych teraz</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4 rounded-l-xl">Status</th>
                <th className="py-3 px-4">Adres IP & Urządzenie</th>
                <th className="py-3 px-4">Lokalizacja</th>
                <th className="py-3 px-4">Aktualnie Przegląda</th>
                <th className="py-3 px-4 text-center">Czas na Stronie</th>
                <th className="py-3 px-4 text-center">Czas Całkowity</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Ostatnia aktywność</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentVisitors.map(visitor => {
                return (
                  <tr
                    key={visitor.id}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* Status Online/Offline */}
                    <td className="py-3.5 px-4">
                      {visitor.isOnline ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ONLINE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                          <span>Ostatnio</span>
                        </span>
                      )}
                    </td>

                    {/* IP Address & Browser */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-neutral-900 text-xs flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{visitor.ip}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center space-x-1 mt-0.5">
                        {visitor.device === 'mobile' ? (
                          <Smartphone className="w-3 h-3" />
                        ) : visitor.device === 'tablet' ? (
                          <Tablet className="w-3 h-3" />
                        ) : (
                          <Monitor className="w-3 h-3" />
                        )}
                        <span>{visitor.browser}</span>
                      </div>
                    </td>

                    {/* Geolocation */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-semibold text-neutral-800">
                        <span>{visitor.flag}</span>
                        <span>{visitor.city}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {visitor.country} ({visitor.countryCode})
                      </span>
                    </td>

                    {/* Current Page */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-neutral-900 bg-neutral-100/90 border border-neutral-200 px-2 py-0.5 rounded-md text-[11px] inline-block">
                        {(visitor as any).pageTitle || visitor.currentPage}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
                        #{visitor.currentPage}
                      </span>
                    </td>

                    {/* Time on Current Page */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-[#D4A373] bg-[#D4A373]/10 px-2.5 py-1 rounded-md text-xs">
                        {formatSeconds(visitor.timeOnCurrentPage)}
                      </span>
                    </td>

                    {/* Total Time */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-md text-xs">
                        {formatSeconds(visitor.totalTimeSeconds)}
                      </span>
                    </td>

                    {/* Last Active Timestamp */}
                    <td className="py-3.5 px-4 text-right text-neutral-500 font-mono text-[11px]">
                      {new Date(visitor.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
