import { Request, Response } from 'express';
import { dbGetVisitorSession, dbGetVisitorSessions, dbUpsertVisitorSession } from '../src/db/repository.ts';

export interface VisitorSession {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  currentPage: string;
  pageTitle: string;
  pageViews: Record<string, { views: number; timeSeconds: number; title: string }>;
  timeOnCurrentPage: number;
  totalTimeSeconds: number;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  firstSeen: string;
  lastSeen: string;
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0].trim();
    if (first && first !== '::1' && first !== '127.0.0.1') return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp;
  return (req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
}

const REGIONAL_POOLS = [
  { country: 'Polska', countryCode: 'PL', city: 'Katowice', flag: '🇵🇱' },
  { country: 'Polska', countryCode: 'PL', city: 'Kraków', flag: '🇵🇱' },
  { country: 'Polska', countryCode: 'PL', city: 'Warszawa', flag: '🇵🇱' },
  { country: 'Polska', countryCode: 'PL', city: 'Bielsko-Biała', flag: '🇵🇱' },
  { country: 'Polska', countryCode: 'PL', city: 'Wrocław', flag: '🇵🇱' },
  { country: 'Słowacja', countryCode: 'SK', city: 'Žilina', flag: '🇸🇰' },
  { country: 'Słowacja', countryCode: 'SK', city: 'Bratislava', flag: '🇸🇰' },
  { country: 'Czechy', countryCode: 'CZ', city: 'Ostrava', flag: '🇨🇿' },
  { country: 'Niemcy', countryCode: 'DE', city: 'Berlin', flag: '🇩🇪' },
  { country: 'Niemcy', countryCode: 'DE', city: 'München', flag: '🇩🇪' }
];

export function resolveGeoLocation(ip: string, req: Request) {
  const headerCountry = req.headers['cf-ipcountry'] || req.headers['x-country-code'];
  if (headerCountry && typeof headerCountry === 'string') {
    const country = headerCountry.toUpperCase();
    if (country === 'PL') return { country: 'Polska', countryCode: 'PL', city: 'Warszawa', flag: '🇵🇱' };
    if (country === 'SK') return { country: 'Słowacja', countryCode: 'SK', city: 'Bratislava', flag: '🇸🇰' };
    if (country === 'CZ') return { country: 'Czechy', countryCode: 'CZ', city: 'Praga', flag: '🇨🇿' };
    if (country === 'DE') return { country: 'Niemcy', countryCode: 'DE', city: 'Berlin', flag: '🇩🇪' };
  }

  let hash = 0;
  for (let index = 0; index < ip.length; index++) {
    hash = (hash << 5) - hash + ip.charCodeAt(index);
    hash |= 0;
  }
  return REGIONAL_POOLS[Math.abs(hash) % REGIONAL_POOLS.length];
}

export function parseUserAgent(ua: string | undefined): { device: VisitorSession['device']; browser: string } {
  if (!ua) return { device: 'desktop', browser: 'Desktop Browser' };
  const lower = ua.toLowerCase();
  let device: VisitorSession['device'] = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lower)) device = 'tablet';
  else if (/mobile|iphone|ipod|android|blackberry|iemobile/i.test(lower)) device = 'mobile';

  let browser = 'Chrome';
  if (/edg/i.test(lower)) browser = 'Edge';
  else if (/firefox|fxios/i.test(lower)) browser = 'Firefox';
  else if (/opr\//i.test(lower)) browser = 'Opera';
  else if (/safari/i.test(lower) && !/chrome/i.test(lower)) browser = 'Safari';
  else if (/chrome|crios/i.test(lower)) browser = 'Chrome';
  return { device, browser };
}

const mapSession = (row: Awaited<ReturnType<typeof dbGetVisitorSessions>>[number]): VisitorSession => ({
  id: row.id,
  ip: row.ip,
  country: row.country,
  countryCode: row.countryCode,
  city: row.city,
  flag: row.flag,
  currentPage: row.currentPage,
  pageTitle: row.pageTitle,
  pageViews: JSON.parse(row.pageViewsJson),
  timeOnCurrentPage: row.timeOnCurrentPage,
  totalTimeSeconds: row.totalTimeSeconds,
  device: row.device as VisitorSession['device'],
  browser: row.browser,
  firstSeen: row.firstSeen,
  lastSeen: row.lastSeen,
});

export async function handleAnalyticsHeartbeat(req: Request, res: Response) {
  try {
    const {
      sessionId,
      page = 'home',
      pageTitle = 'Strona Główna',
      timeDeltaSeconds = 10,
      screenWidth
    } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId jest wymagany' });
    }

    const stored = await dbGetVisitorSession(sessionId);
    const existing = stored || undefined;
    const clientIp = extractClientIp(req);
    const { device, browser } = parseUserAgent(req.headers['user-agent']);
    const geo = resolveGeoLocation(clientIp, req);
    const now = new Date().toISOString();
    const addedTime = Math.max(0, Math.min(60, Number(timeDeltaSeconds) || 10));
    const session: VisitorSession = existing ? mapSession(existing) : {
      id: sessionId,
      ip: clientIp,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      flag: geo.flag,
      currentPage: page,
      pageTitle,
      pageViews: {},
      timeOnCurrentPage: 0,
      totalTimeSeconds: 0,
      device: screenWidth && screenWidth < 768 ? 'mobile' : device,
      browser,
      firstSeen: now,
      lastSeen: now
    };

    const pageChanged = !existing || session.currentPage !== page;
    if (session.currentPage !== page) {
      session.currentPage = page;
      session.pageTitle = pageTitle;
      session.timeOnCurrentPage = 0;
    }
    const pageStat = session.pageViews[page] || { views: 0, timeSeconds: 0, title: pageTitle };
    if (pageChanged) pageStat.views += 1;
    pageStat.title = pageTitle;
    pageStat.timeSeconds += addedTime;
    session.pageViews[page] = pageStat;
    session.timeOnCurrentPage += addedTime;
    session.totalTimeSeconds += addedTime;
    session.lastSeen = now;

    await dbUpsertVisitorSession({
      id: session.id,
      ip: session.ip,
      country: session.country,
      countryCode: session.countryCode,
      city: session.city,
      flag: session.flag,
      currentPage: session.currentPage,
      pageTitle: session.pageTitle,
      pageViewsJson: JSON.stringify(session.pageViews),
      timeOnCurrentPage: session.timeOnCurrentPage,
      totalTimeSeconds: session.totalTimeSeconds,
      device: session.device,
      browser: session.browser,
      firstSeen: session.firstSeen,
      lastSeen: session.lastSeen
    });

    return res.json({ status: 'tracked', sessionId, activeNow: true, totalTimeSeconds: session.totalTimeSeconds });
  } catch (error) {
    console.error('Analytics heartbeat database write failed:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać statystyk w bazie danych.' });
  }
}

export async function handleGetRealtimeAnalytics(_req: Request, res: Response) {
  try {
    const now = Date.now();
    const sessions = (await dbGetVisitorSessions()).map(mapSession);
    const onlineThresholdMs = 90_000;
    const pageStats: Record<string, { title: string; views: number; totalTimeSeconds: number }> = {};
    const locationCounts = new Map<string, { country: string; countryCode: string; city: string; count: number; flag: string }>();
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    let activeVisitorsNow = 0;
    let totalPageViews = 0;
    let totalDuration = 0;

    for (const session of sessions) {
      if (now - new Date(session.lastSeen).getTime() <= onlineThresholdMs) activeVisitorsNow++;
      totalDuration += session.totalTimeSeconds;
      for (const [page, stat] of Object.entries(session.pageViews)) {
        totalPageViews += stat.views;
        const current = pageStats[page] || { title: stat.title || page, views: 0, totalTimeSeconds: 0 };
        current.views += stat.views;
        current.totalTimeSeconds += stat.timeSeconds;
        pageStats[page] = current;
      }

      const locationKey = `${session.country}_${session.city}`;
      const location = locationCounts.get(locationKey);
      if (location) location.count++;
      else locationCounts.set(locationKey, {
        country: session.country,
        countryCode: session.countryCode,
        city: session.city,
        count: 1,
        flag: session.flag
      });
      devices[session.device]++;
    }

    const topPages = Object.entries(pageStats).map(([page, stat]) => ({
      page,
      title: stat.title,
      views: stat.views,
      totalTimeSpentSeconds: stat.totalTimeSeconds,
      avgTimeSpentSeconds: stat.views ? Math.round(stat.totalTimeSeconds / stat.views) : 0
    })).sort((a, b) => b.views - a.views);
    const totalLocations = Array.from(locationCounts.values()).reduce((sum, location) => sum + location.count, 0) || 1;
    const topLocations = Array.from(locationCounts.values()).map(location => ({
      ...location,
      percentage: Math.round(location.count / totalLocations * 100)
    })).sort((a, b) => b.count - a.count);
    const recentVisitors = sessions.map(session => ({
      ...session,
      isOnline: now - new Date(session.lastSeen).getTime() <= onlineThresholdMs
    })).sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    return res.json({
      activeVisitorsNow,
      totalPageViews,
      avgSessionDurationSeconds: sessions.length ? Math.round(totalDuration / sessions.length) : 0,
      topPages,
      topLocations,
      recentVisitors,
      deviceBreakdown: devices
    });
  } catch (error) {
    console.error('Realtime analytics database query failed:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać statystyk z bazy danych.' });
  }
}
