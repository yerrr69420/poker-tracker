import type { SessionRow, SiteRow, GameTypeEnum, SessionFormat } from './database';

export interface SessionWithSite extends SessionRow {
  site: SiteRow;
}

export interface SessionFormData {
  site_id: string;
  is_live: boolean;
  game_type: GameTypeEnum;
  format: SessionFormat;
  stakes_text: string;
  start_time: string;
  end_time: string;
  buy_in_total: number; // dollars, convert to cents before insert
  cash_out_total: number;
  notes: string;
  // Tournament fields
  tournament_name: string;
  finish_position: number | null;
  field_size: number | null;
  itm: boolean | null;
  rebuys_count: number;
  rebuy_cost: number;
  addons_count: number;
  addon_cost: number;
  prize_pool: number | null;
}

export interface DashboardStats {
  todayProfit: number; // cents
  todayHours: number;
  todaySessions: number;
  weekProfit: number;
  monthProfit: number;
  siteBreakdown: SiteProfit[];
}

export interface SiteProfit {
  site: SiteRow;
  profit: number; // cents
  sessionCount: number;
}
