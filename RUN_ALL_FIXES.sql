-- ============================================================
-- RUN THIS ONCE in Supabase Dashboard → SQL Editor
-- Creates: sites, sessions, bankroll_snapshots (fixes Add Session)
-- Copy ALL lines below, paste in SQL Editor, click RUN
-- ============================================================

-- ─── 1. Enums ───────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE site_type AS ENUM ('online', 'live');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE session_format AS ENUM ('cash', 'tournament');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE game_type_enum AS ENUM ('NLH', 'PLO', 'PLO5', 'NLO', 'LHE', 'mixed', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. Sites table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type site_type NOT NULL DEFAULT 'online',
  currency text NOT NULL DEFAULT 'USD',
  is_preset boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sites_select" ON sites;
CREATE POLICY "sites_select" ON sites FOR SELECT USING (is_preset = true OR user_id = auth.uid());
DROP POLICY IF EXISTS "sites_insert" ON sites;
CREATE POLICY "sites_insert" ON sites FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "sites_update" ON sites;
CREATE POLICY "sites_update" ON sites FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "sites_delete" ON sites;
CREATE POLICY "sites_delete" ON sites FOR DELETE USING (user_id = auth.uid() AND is_preset = false);

-- Preset sites (only if table is empty of presets)
INSERT INTO sites (user_id, name, type, currency, is_preset)
SELECT NULL, 'PokerStars', 'online', 'USD', true WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'PokerStars' AND is_preset = true);
INSERT INTO sites (user_id, name, type, currency, is_preset)
SELECT NULL, 'Local Casino', 'live', 'USD', true WHERE NOT EXISTS (SELECT 1 FROM sites WHERE name = 'Local Casino' AND is_preset = true);

-- ─── 3. Sessions table ───────────────────────────────────────
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
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (user_id = auth.uid());

-- ─── 4. Bankroll snapshots table ─────────────────────────────
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
ALTER TABLE bankroll_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bankroll_select" ON bankroll_snapshots;
CREATE POLICY "bankroll_select" ON bankroll_snapshots FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "bankroll_insert" ON bankroll_snapshots;
CREATE POLICY "bankroll_insert" ON bankroll_snapshots FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "bankroll_update" ON bankroll_snapshots;
CREATE POLICY "bankroll_update" ON bankroll_snapshots FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "bankroll_delete" ON bankroll_snapshots;
CREATE POLICY "bankroll_delete" ON bankroll_snapshots FOR DELETE USING (user_id = auth.uid());

SELECT '✅ Done! sites, sessions, and bankroll_snapshots are ready.' AS result;
