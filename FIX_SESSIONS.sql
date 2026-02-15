-- ============================================================
-- QUICK FIX: Create sessions table (and bankroll_snapshots)
-- Run in Supabase Dashboard → SQL Editor. Copy all, paste, Run.
-- ============================================================

-- Enums (skip if already exist)
DO $$ BEGIN
  CREATE TYPE session_format AS ENUM ('cash', 'tournament');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE game_type_enum AS ENUM ('NLH', 'PLO', 'PLO5', 'NLO', 'LHE', 'mixed', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sessions (requires sites table to exist — run FIX_SITES.sql first if needed)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  is_live boolean NOT NULL DEFAULT false,
  game_type game_type_enum NOT NULL DEFAULT 'NLH',
  format session_format NOT NULL DEFAULT 'cash',
  stakes_text text NOT NULL DEFAULT '',
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  buy_in_total integer NOT NULL DEFAULT 0,
  cash_out_total integer NOT NULL DEFAULT 0,
  profit integer GENERATED ALWAYS AS (cash_out_total - buy_in_total) STORED,
  notes text,
  tournament_name text,
  finish_position integer,
  field_size integer,
  itm boolean,
  rebuys_count integer NOT NULL DEFAULT 0,
  rebuy_cost integer NOT NULL DEFAULT 0,
  addons_count integer NOT NULL DEFAULT 0,
  addon_cost integer NOT NULL DEFAULT 0,
  prize_pool integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_start ON sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_site ON sessions(site_id);

-- Bankroll snapshots (for Bankroll page)
CREATE TABLE IF NOT EXISTS bankroll_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount integer NOT NULL DEFAULT 0,
  is_manual_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_id, date)
);

CREATE INDEX IF NOT EXISTS idx_bankroll_user ON bankroll_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_bankroll_user_date ON bankroll_snapshots(user_id, date DESC);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bankroll_select" ON bankroll_snapshots;
CREATE POLICY "bankroll_select" ON bankroll_snapshots FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bankroll_insert" ON bankroll_snapshots;
CREATE POLICY "bankroll_insert" ON bankroll_snapshots FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "bankroll_update" ON bankroll_snapshots;
CREATE POLICY "bankroll_update" ON bankroll_snapshots FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "bankroll_delete" ON bankroll_snapshots;
CREATE POLICY "bankroll_delete" ON bankroll_snapshots FOR DELETE USING (user_id = auth.uid());

SELECT '✅ sessions and bankroll_snapshots tables created successfully!' AS result;
