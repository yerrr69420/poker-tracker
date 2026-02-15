-- ============================================================
-- QUICK FIX FOR SITES TABLE
-- Run this in Supabase Dashboard → SQL Editor
-- Copy everything below and paste into SQL Editor, then click RUN
-- ============================================================

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE site_type AS ENUM ('online', 'live');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_format AS ENUM ('cash', 'tournament');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE game_type_enum AS ENUM ('NLH', 'PLO', 'PLO5', 'NLO', 'LHE', 'mixed', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Sites ────────────────────────────────────────────────────
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

-- Enable RLS and policies for sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sites_select" ON sites;
CREATE POLICY "sites_select" ON sites
  FOR SELECT USING (is_preset = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "sites_insert" ON sites;
CREATE POLICY "sites_insert" ON sites
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sites_update" ON sites;
CREATE POLICY "sites_update" ON sites
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sites_delete" ON sites;
CREATE POLICY "sites_delete" ON sites
  FOR DELETE USING (user_id = auth.uid() AND is_preset = false);

-- Optional: create a couple of starter sites (safe to run multiple times)
INSERT INTO sites (user_id, name, type, currency, is_preset)
VALUES
  (NULL, 'PokerStars', 'online', 'USD', true),
  (NULL, 'Local Casino', 'live', 'USD', true)
ON CONFLICT DO NOTHING;

SELECT '✅ sites table and policies created or verified successfully!' AS result;

