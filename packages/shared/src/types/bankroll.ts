import type { BankrollSnapshotRow, SiteRow } from './database';

export interface BankrollSiteEntry {
  site: SiteRow;
  amount: number; // cents
  isManualOverride: boolean;
}

export interface BankrollSummary {
  date: string;
  total: number; // cents
  sites: BankrollSiteEntry[];
  previousTotal: number | null; // for delta display
}

export interface BankrollChartPoint {
  date: string;
  total: number; // cents
}

export interface BankrollSnapshot extends BankrollSnapshotRow {
  site?: SiteRow;
}
