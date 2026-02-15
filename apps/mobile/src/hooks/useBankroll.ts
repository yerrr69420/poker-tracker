import { useState, useEffect, useCallback } from 'react';
import type {
  SiteRow, SessionRow, BankrollSnapshotRow,
  BankrollSummary, BankrollSiteEntry, BankrollChartPoint,
} from '@poker-tracker/shared';
import { calculateSiteBankroll, calculateTotalBankroll } from '@poker-tracker/shared';
import { supabase } from '../lib/supabase';
import { fetchSites } from '../lib/queries/sites';
import { fetchSessions } from '../lib/queries/sessions';
import { fetchSnapshots, upsertSnapshot } from '../lib/queries/bankroll';

export function useBankroll() {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [snapshots, setSnapshots] = useState<BankrollSnapshotRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [sitesData, sessionsData, snapshotsData] = await Promise.all([
        fetchSites(),
        fetchSessions(500),
        fetchSnapshots(user.id),
      ]);

      setSites(sitesData);
      setSessions(sessionsData as SessionRow[]);
      setSnapshots(snapshotsData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getSummary = useCallback((date: string): BankrollSummary => {
    // Only include sites the user has interacted with
    const userSiteIds = new Set<string>();
    for (const s of sessions) userSiteIds.add(s.site_id);
    for (const s of snapshots) userSiteIds.add(s.site_id);

    const activeSiteIds = Array.from(userSiteIds);

    const siteEntries: BankrollSiteEntry[] = activeSiteIds.map((siteId) => {
      const site = sites.find((s) => s.id === siteId);
      const amount = calculateSiteBankroll(siteId, date, sessions, snapshots);
      const override = snapshots.find(
        (s) => s.site_id === siteId && s.date === date && s.is_manual_override
      );
      return {
        site: site || { id: siteId, name: 'Unknown', type: 'online', currency: 'USD', is_preset: false, user_id: null, created_at: '' },
        amount,
        isManualOverride: !!override,
      };
    }).filter((e) => e.amount !== 0 || e.isManualOverride);

    const total = siteEntries.reduce((sum, e) => sum + e.amount, 0);

    // Previous day total for delta
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().slice(0, 10);
    const previousTotal = calculateTotalBankroll(activeSiteIds, prevDateStr, sessions, snapshots);

    return { date, total, sites: siteEntries, previousTotal };
  }, [sites, sessions, snapshots]);

  const getChartData = useCallback((days = 14): BankrollChartPoint[] => {
    const userSiteIds = new Set<string>();
    for (const s of sessions) userSiteIds.add(s.site_id);
    for (const s of snapshots) userSiteIds.add(s.site_id);
    const siteIds = Array.from(userSiteIds);

    const points: BankrollChartPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const total = calculateTotalBankroll(siteIds, dateStr, sessions, snapshots);
      points.push({ date: dateStr, total });
    }
    return points;
  }, [sessions, snapshots]);

  const setManualOverride = useCallback(async (siteId: string, date: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await upsertSnapshot({
      user_id: user.id,
      site_id: siteId,
      date,
      amount,
      is_manual_override: true,
    });
    await load();
  }, [load]);

  return {
    sites,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    getSummary,
    getChartData,
    setManualOverride,
    reload: load,
  };
}
