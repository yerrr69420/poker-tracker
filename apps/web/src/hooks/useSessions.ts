'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SessionWithSite, SessionInsert, SiteRow, SiteProfit, DashboardStats } from '@poker-tracker/shared';
import { dailyProfit, dailyHours } from '@poker-tracker/shared';
import { fetchSessions, createSession, deleteSession } from '@/lib/queries/sessions';
import { fetchSites } from '@/lib/queries/sites';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionWithSite[]>([]);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, sitesData] = await Promise.all([fetchSessions(), fetchSites()]);
      setSessions(sessionsData);
      setSites(sitesData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addSession = useCallback(async (session: SessionInsert) => {
    const created = await createSession(session);
    await load();
    return created;
  }, [load]);

  const removeSession = useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { sessions, sites, loading, error, reload: load, addSession, removeSession };
}

export function useDashboardStats(sessions: SessionWithSite[]): DashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const todaySessions = sessions.filter((s) => s.start_time.slice(0, 10) === today);

  const siteMap = new Map<string, SiteProfit>();
  for (const s of todaySessions) {
    const existing = siteMap.get(s.site_id);
    if (existing) {
      existing.profit += s.profit;
      existing.sessionCount += 1;
    } else {
      siteMap.set(s.site_id, { site: s.site, profit: s.profit, sessionCount: 1 });
    }
  }

  const weekProfit = sessions
    .filter((s) => s.start_time.slice(0, 10) >= weekAgo)
    .reduce((sum, s) => sum + s.profit, 0);

  const monthProfit = sessions
    .filter((s) => s.start_time.slice(0, 10) >= monthAgo)
    .reduce((sum, s) => sum + s.profit, 0);

  return {
    todayProfit: dailyProfit(sessions, today),
    todayHours: dailyHours(sessions, today),
    todaySessions: todaySessions.length,
    weekProfit,
    monthProfit,
    siteBreakdown: Array.from(siteMap.values()),
  };
}
