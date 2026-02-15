-- ============================================================
-- QUICK FIX: Run this in Supabase Dashboard → SQL Editor
-- Copy everything below and paste into SQL Editor, then click RUN
-- ============================================================

-- Create enums if they don't exist (REQUIRED - these must exist before creating tables)
DO $$ BEGIN
  CREATE TYPE session_format AS ENUM ('cash', 'tournament');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE game_type_enum AS ENUM ('NLH', 'PLO', 'PLO5', 'NLO', 'LHE', 'mixed', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_visibility AS ENUM ('public', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE street_enum AS ENUM ('none', 'preflop', 'flop', 'turn', 'river', 'showdown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create hand_posts table
CREATE TABLE IF NOT EXISTS hand_posts (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hand_posts_user ON hand_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_hand_posts_created ON hand_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hand_posts_visibility ON hand_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_hand_posts_tags ON hand_posts USING gin(tags);

-- Create hand_comments table
CREATE TABLE IF NOT EXISTS hand_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES hand_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES hand_comments(id) ON DELETE CASCADE,
  street_anchor street_enum NOT NULL DEFAULT 'none',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON hand_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON hand_comments(parent_comment_id);

-- Create trigger function for comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hand_posts SET comment_count = comment_count + 1, updated_at = now() WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hand_posts SET comment_count = GREATEST(0, comment_count - 1), updated_at = now() WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trg_comment_count_insert ON hand_comments;
CREATE TRIGGER trg_comment_count_insert AFTER INSERT ON hand_comments FOR EACH ROW EXECUTE FUNCTION update_comment_count();

DROP TRIGGER IF EXISTS trg_comment_count_delete ON hand_comments;
CREATE TRIGGER trg_comment_count_delete AFTER DELETE ON hand_comments FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hand_posts_updated ON hand_posts;
CREATE TRIGGER trg_hand_posts_updated BEFORE UPDATE ON hand_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE hand_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hand_posts
DROP POLICY IF EXISTS "hand_posts_select" ON hand_posts;
CREATE POLICY "hand_posts_select" ON hand_posts FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

DROP POLICY IF EXISTS "hand_posts_insert" ON hand_posts;
CREATE POLICY "hand_posts_insert" ON hand_posts FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "hand_posts_update" ON hand_posts;
CREATE POLICY "hand_posts_update" ON hand_posts FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "hand_posts_delete" ON hand_posts;
CREATE POLICY "hand_posts_delete" ON hand_posts FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for hand_comments
DROP POLICY IF EXISTS "comments_select" ON hand_comments;
CREATE POLICY "comments_select" ON hand_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM hand_posts WHERE hand_posts.id = hand_comments.post_id AND (hand_posts.visibility = 'public' OR hand_posts.user_id = auth.uid()))
);

DROP POLICY IF EXISTS "comments_insert" ON hand_comments;
CREATE POLICY "comments_insert" ON hand_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM hand_posts WHERE hand_posts.id = post_id AND (hand_posts.visibility = 'public' OR hand_posts.user_id = auth.uid()))
);

DROP POLICY IF EXISTS "comments_delete" ON hand_comments;
CREATE POLICY "comments_delete" ON hand_comments FOR DELETE USING (user_id = auth.uid());

-- Success message (won't show in Supabase, but helps confirm it ran)
SELECT '✅ hand_posts and hand_comments tables created successfully!' as result;
