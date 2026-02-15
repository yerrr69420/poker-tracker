-- ============================================================
-- Poker Tracker — Full Database Schema
-- Run this in Supabase SQL Editor or via CLI migration
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE session_format AS ENUM ('cash', 'tournament');
CREATE TYPE site_type AS ENUM ('online', 'live');
CREATE TYPE post_visibility AS ENUM ('public', 'private');
CREATE TYPE street_enum AS ENUM ('none', 'preflop', 'flop', 'turn', 'river', 'showdown');
CREATE TYPE game_type_enum AS ENUM ('NLH', 'PLO', 'PLO5', 'NLO', 'LHE', 'mixed', 'other');

-- ── Sites ────────────────────────────────────────────────────

CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type site_type NOT NULL DEFAULT 'online',
  currency text NOT NULL DEFAULT 'USD',
  is_preset boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sites_user ON sites(user_id);

-- ── Sessions ─────────────────────────────────────────────────

CREATE TABLE sessions (
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
  -- Tournament-specific fields
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

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_user_start ON sessions(user_id, start_time DESC);
CREATE INDEX idx_sessions_site ON sessions(site_id);

-- ── Bankroll Snapshots ───────────────────────────────────────

CREATE TABLE bankroll_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount integer NOT NULL DEFAULT 0,
  is_manual_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, site_id, date)
);

CREATE INDEX idx_bankroll_user ON bankroll_snapshots(user_id);
CREATE INDEX idx_bankroll_user_date ON bankroll_snapshots(user_id, date DESC);

-- ── Hand Posts ────────────────────────────────────────────────

CREATE TABLE hand_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  hh_raw_text text,
  hero_hand text,
  board text,
  stakes_text text,
  game_type game_type_enum,
  format session_format,
  is_live boolean,
  site_name text,
  tags text[] NOT NULL DEFAULT '{}',
  visibility post_visibility NOT NULL DEFAULT 'public',
  post_anonymous boolean NOT NULL DEFAULT false,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hand_posts_user ON hand_posts(user_id);
CREATE INDEX idx_hand_posts_created ON hand_posts(created_at DESC);
CREATE INDEX idx_hand_posts_visibility ON hand_posts(visibility);
CREATE INDEX idx_hand_posts_tags ON hand_posts USING gin(tags);

-- ── Hand Comments ─────────────────────────────────────────────

CREATE TABLE hand_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES hand_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES hand_comments(id) ON DELETE CASCADE,
  street_anchor street_enum NOT NULL DEFAULT 'none',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON hand_comments(post_id);
CREATE INDEX idx_comments_parent ON hand_comments(parent_comment_id);

-- ── Triggers ──────────────────────────────────────────────────

-- Auto-update comment_count on hand_posts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hand_posts
    SET comment_count = comment_count + 1, updated_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hand_posts
    SET comment_count = GREATEST(0, comment_count - 1), updated_at = now()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_count_insert
  AFTER INSERT ON hand_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

CREATE TRIGGER trg_comment_count_delete
  AFTER DELETE ON hand_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Auto-update updated_at on hand_posts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hand_posts_updated
  BEFORE UPDATE ON hand_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_comments ENABLE ROW LEVEL SECURITY;

-- Sites: see own + presets; CRUD own
CREATE POLICY "sites_select" ON sites
  FOR SELECT USING (is_preset = true OR user_id = auth.uid());

CREATE POLICY "sites_insert" ON sites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sites_update" ON sites
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "sites_delete" ON sites
  FOR DELETE USING (user_id = auth.uid() AND is_preset = false);

-- Sessions: private to owner
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "sessions_delete" ON sessions
  FOR DELETE USING (user_id = auth.uid());

-- Bankroll snapshots: private to owner
CREATE POLICY "bankroll_select" ON bankroll_snapshots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "bankroll_insert" ON bankroll_snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "bankroll_update" ON bankroll_snapshots
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "bankroll_delete" ON bankroll_snapshots
  FOR DELETE USING (user_id = auth.uid());

-- Hand posts: public posts visible to all, private to owner only
CREATE POLICY "hand_posts_select" ON hand_posts
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "hand_posts_insert" ON hand_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "hand_posts_update" ON hand_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "hand_posts_delete" ON hand_posts
  FOR DELETE USING (user_id = auth.uid());

-- Hand comments: readable if post is readable, insertable by any auth user on public posts
CREATE POLICY "comments_select" ON hand_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hand_posts
      WHERE hand_posts.id = hand_comments.post_id
        AND (hand_posts.visibility = 'public' OR hand_posts.user_id = auth.uid())
    )
  );

CREATE POLICY "comments_insert" ON hand_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM hand_posts
      WHERE hand_posts.id = post_id
        AND (hand_posts.visibility = 'public' OR hand_posts.user_id = auth.uid())
    )
  );

CREATE POLICY "comments_delete" ON hand_comments
  FOR DELETE USING (user_id = auth.uid());
