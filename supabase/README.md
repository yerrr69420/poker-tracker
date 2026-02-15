# Supabase setup

- **Full schema:** Run `schema.sql` in Supabase Dashboard → SQL Editor when setting up a new project (creates all tables, enums, RLS).
- **Seed preset sites:** Run `seed.sql` after the schema to add preset poker sites (PokerStars, GGPoker, etc.).
- **If you get "could not find table hand_posts":** Run the SQL in `migrations/20240213060000_create_hand_posts.sql` in the SQL Editor. This creates `hand_posts`, `hand_comments`, triggers, and RLS.
