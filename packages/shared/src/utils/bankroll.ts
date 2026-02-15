import type { SessionRow, BankrollSnapshotRow } from '../types/database';

/**
 * Calculate bankroll for a given site on a given date.
 *
 * Logic:
 * 1. Find the most recent manual override snapshot for this site on or before the date
 * 2. Sum all session profits for this site after the override date (or all time if no override)
 * 3. Result = override amount + cumulative profit since override
 */
export function calculateSiteBankroll(
  siteId: string,
  targetDate: string,
  sessions: SessionRow[],
  snapshots: BankrollSnapshotRow[]
): number {
  // Find most recent manual override for this site on or before targetDate
  const overrides = snapshots
    .filter(
      (s) =>
        s.site_id === siteId &&
        s.is_manual_override &&
        s.date <= targetDate
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const latestOverride = overrides[0];
  const baseAmount = latestOverride ? latestOverride.amount : 0;
  const sinceDate = latestOverride ? latestOverride.date : '1970-01-01';

  // Sum session profits for this site since the override
  const profitSince = sessions
    .filter(
      (s) =>
        s.site_id === siteId &&
        s.start_time.substring(0, 10) > sinceDate &&
        s.start_time.substring(0, 10) <= targetDate
    )
    .reduce((sum, s) => sum + s.profit, 0);

  return baseAmount + profitSince;
}

/**
 * Calculate total bankroll across all sites for a given date.
 */
export function calculateTotalBankroll(
  siteIds: string[],
  targetDate: string,
  sessions: SessionRow[],
  snapshots: BankrollSnapshotRow[]
): number {
  return siteIds.reduce(
    (total, siteId) =>
      total + calculateSiteBankroll(siteId, targetDate, sessions, snapshots),
    0
  );
}

/**
 * Calculate daily profit for a given date.
 */
export function dailyProfit(sessions: SessionRow[], date: string): number {
  return sessions
    .filter((s) => s.start_time.substring(0, 10) === date)
    .reduce((sum, s) => sum + s.profit, 0);
}

/**
 * Calculate total hours played for a given date.
 */
export function dailyHours(sessions: SessionRow[], date: string): number {
  return sessions
    .filter((s) => s.start_time.substring(0, 10) === date && s.end_time)
    .reduce((sum, s) => {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time!).getTime();
      return sum + (end - start) / 3600000;
    }, 0);
}
