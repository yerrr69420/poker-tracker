// ── Enums ──────────────────────────────────────────────
export type SessionFormat = 'cash' | 'tournament';
export type SiteType = 'online' | 'live';
export type PostVisibility = 'public' | 'private';
export type StreetEnum = 'none' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type GameTypeEnum = 'NLH' | 'PLO' | 'PLO5' | 'NLO' | 'LHE' | 'mixed' | 'other';

// ── Row types ──────────────────────────────────────────
export interface SiteRow {
  id: string;
  user_id: string | null;
  name: string;
  type: SiteType;
  currency: string;
  is_preset: boolean;
  created_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  site_id: string;
  is_live: boolean;
  game_type: GameTypeEnum;
  format: SessionFormat;
  stakes_text: string;
  start_time: string;
  end_time: string | null;
  buy_in_total: number;
  cash_out_total: number;
  profit: number; // generated column
  notes: string | null;
  tournament_name: string | null;
  finish_position: number | null;
  field_size: number | null;
  itm: boolean | null;
  rebuys_count: number;
  rebuy_cost: number;
  addons_count: number;
  addon_cost: number;
  prize_pool: number | null;
  created_at: string;
}

export interface BankrollSnapshotRow {
  id: string;
  user_id: string;
  site_id: string;
  date: string;
  amount: number;
  is_manual_override: boolean;
  created_at: string;
}

export interface HandPostRow {
  id: string;
  user_id: string;
  title: string;
  hh_raw_text: string | null;
  hero_hand: string | null;
  board: string | null;
  stakes_text: string | null;
  game_type: GameTypeEnum | null;
  format: SessionFormat | null;
  is_live: boolean | null;
  site_name: string | null;
  tags: string[];
  visibility: PostVisibility;
  post_anonymous: boolean;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface HandCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  street_anchor: StreetEnum;
  body: string;
  created_at: string;
}

// ── Insert types ───────────────────────────────────────
export type SiteInsert = Omit<SiteRow, 'id' | 'created_at'>;
export type SessionInsert = Omit<SessionRow, 'id' | 'profit' | 'created_at'>;
export type BankrollSnapshotInsert = Omit<BankrollSnapshotRow, 'id' | 'created_at'>;
export type HandPostInsert = Omit<HandPostRow, 'id' | 'comment_count' | 'created_at' | 'updated_at'>;
export type HandCommentInsert = Omit<HandCommentRow, 'id' | 'created_at'>;
