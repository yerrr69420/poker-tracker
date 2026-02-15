-- ============================================================
-- Poker Tracker — Seed Data
-- Preset poker sites (user_id = NULL, is_preset = true)
-- ============================================================

INSERT INTO sites (user_id, name, type, currency, is_preset) VALUES
  -- Online sites
  (NULL, 'PokerStars',              'online', 'USD', true),
  (NULL, 'GGPoker',                 'online', 'USD', true),
  (NULL, 'WPT Global',             'online', 'USD', true),
  (NULL, 'partypoker',             'online', 'USD', true),
  (NULL, '888poker',               'online', 'USD', true),
  (NULL, 'ACR (Americas Cardroom)','online', 'USD', true),
  (NULL, 'BetOnline',              'online', 'USD', true),
  (NULL, 'Ignition',               'online', 'USD', true),
  (NULL, 'Bovada',                 'online', 'USD', true),
  (NULL, 'ClubGG',                 'online', 'USD', true),
  (NULL, 'Winamax',                'online', 'EUR', true),
  (NULL, 'iPoker Network',         'online', 'EUR', true),
  -- Live venues
  (NULL, 'Local Casino',           'live',   'USD', true),
  (NULL, 'Home Game',              'live',   'USD', true),
  (NULL, 'Bellagio',               'live',   'USD', true),
  (NULL, 'Aria',                   'live',   'USD', true),
  (NULL, 'Wynn',                   'live',   'USD', true),
  (NULL, 'Commerce Casino',        'live',   'USD', true),
  (NULL, 'Hustler Casino',         'live',   'USD', true);
