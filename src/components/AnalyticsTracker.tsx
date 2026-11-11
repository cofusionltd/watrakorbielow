import React, { useEffect, useRef } from 'react';
import { PageView } from '../types';

interface AnalyticsTrackerProps {
  currentPage: PageView;
}

const PAGE_TITLES: Record<PageView, string> = {
  home: "Strona Główna",
  about: "O Nas & Resort",
  rooms: "Pokoje & Cennik",
  seasons: "Zima & Lato (Pilsko)",
  wellness: "Wellness & Jacuzzi",
  restaurant: "Karczma & Grill",
  packages: "Pakiety & Promocje",
  contact: "Kontakt & Dojazd",
  admin: "Panel Administracyjny"
};

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ currentPage }) => {
  const lastHeartbeatRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    // Generate or get existing visitor session ID
    let sid = sessionStorage.getItem('watra_visitor_sid');
    if (!sid) {
      sid = 'v-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      sessionStorage.setItem('watra_visitor_sid', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  useEffect(() => {
    if (!sessionIdRef.current) {
      let sid = sessionStorage.getItem('watra_visitor_sid');
      if (!sid) {
        sid = 'v-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
        sessionStorage.setItem('watra_visitor_sid', sid);
      }
      sessionIdRef.current = sid;
    }

    const sid = sessionIdRef.current;
    const pageTitle = PAGE_TITLES[currentPage] || currentPage;

    // Send initial page arrival event
    fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        page: currentPage,
        pageTitle,
        timeDeltaSeconds: 0,
        screenWidth: window.innerWidth
      })
    }).catch(() => {});

    lastHeartbeatRef.current = Date.now();

    // Send periodic heartbeats every 10 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.round((now - lastHeartbeatRef.current) / 1000);
      lastHeartbeatRef.current = now;

      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          page: currentPage,
          pageTitle,
          timeDeltaSeconds: deltaSec,
          screenWidth: window.innerWidth
        })
      }).catch(() => {});
    }, 10000);

    // Send departure time before page unloads or changes
    return () => {
      clearInterval(interval);
      const deltaSec = Math.round((Date.now() - lastHeartbeatRef.current) / 1000);
      if (deltaSec > 0) {
        try {
          const payload = JSON.stringify({
            sessionId: sid,
            page: currentPage,
            pageTitle,
            timeDeltaSeconds: deltaSec,
            screenWidth: window.innerWidth
          });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/heartbeat', new Blob([payload], { type: 'application/json' }));
          } else {
            fetch('/api/analytics/heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            });
          }
        } catch (_) {}
      }
    };
  }, [currentPage]);

  return null; // Silent invisible telemetry tracker
};
