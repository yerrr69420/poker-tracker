# Poker Tracker

A poker session tracking and hand review app with a **cyber poker** theme. Monorepo with an Expo React Native mobile app and a Next.js web app, both powered by a shared Supabase backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Mobile | Expo (React Native), React Navigation, Reanimated, Gesture Handler |
| Web | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Shared | TypeScript types, theme tokens, utilities |

## Project Structure

```
poker-tracker/
├── packages/shared/       # Types, theme tokens, constants, utilities
├── apps/mobile/           # Expo React Native app
├── apps/web/              # Next.js web app
└── supabase/              # Schema + seed SQL
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Supabase** project (free tier works)
- **Expo Go** app on your phone (for mobile development)

## Setup

### 1. Install dependencies

```bash
cd poker-tracker
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database

1. Go to your Supabase dashboard > SQL Editor
2. Run the contents of `supabase/schema.sql` to create all tables, enums, indexes, RLS policies, and triggers
3. Run the contents of `supabase/seed.sql` to insert preset poker sites

### 4. Run the apps

**Web (Next.js):**
```bash
pnpm dev:web
```
Opens at `http://localhost:3000`

**Mobile (Expo):**
```bash
pnpm dev:mobile
```
Scan the QR code with Expo Go on your phone.

## Features

### Session Tracker
- Log cash game and tournament sessions
- Track buy-ins, cash-outs, auto-calculated profit
- Tournament fields: finish position, field size, ITM, rebuys, add-ons
- Per-site breakdown with preset + custom site support
- Today dashboard with daily/weekly/monthly P&L

### Bankroll Management
- Auto-calculated from session history
- Per-site balance tracking
- Manual override for deposits/withdrawals
- 14-day chart visualization
- Date navigation with daily deltas

### Hand Review Community
- Post hands for community review (public or private)
- Paste hand history text or build hands manually
- 4-color deck card rendering
- 30 categorization tags (bluff, value-bet, three-bet, etc.)
- Threaded comments with street anchors (preflop, flop, turn, river)
- Feed tabs: Latest, Unanswered, My Posts
- Anonymous posting support

### Offline Support
- Mutation queue (AsyncStorage on mobile, localStorage on web)
- Auto-sync on app foreground, network restore, and visibility change
- Exponential backoff with max 5 retries
- Pending count indicator in navigation

## Design System

The app uses a **cyber poker** theme inspired by a blue hacker frog mascot:

- **Dark backgrounds**: Deep navy (#0a0e1a) with card surfaces (#111827)
- **Neon accents**: Cyan primary (#00e5ff), green profit (#00ff87), red loss (#ff1744)
- **4-color deck**: Spades (white), Hearts (red), Diamonds (blue), Clubs (green)
- **Neon glow effects**: Pulsing shadows on cards and mascot based on session profit/loss
- **Poker chip UI**: Chip-styled buttons with spring bounce animations, chip stacks for amounts

### Animation Details

**Mobile (Reanimated):**
- Chip buttons: Spring press-in (0.85) with overshoot bounce-out (1.06 → 1.0)
- Card flip: Timing to -8° overshoot then spring settle to 0°
- Board deal: Staggered zoom-in with spring (flop 80ms apart, turn at 450ms, river at 750ms)
- Chips to pot: Slide → scale punch (1.3x) → spring split to final position
- Mascot glow: Fast pulse for profit, slow dim pulse for loss
- NeonCard: Continuous shadow opacity pulse

**Web (Framer Motion):**
- Chip buttons: whileTap scale 0.85, whileHover 1.05 with spring
- Board deal: Staggered scale-in from 0.6 with spring
- NeonCard: CSS box-shadow animation between dim and bright neon
- Card flip: CSS perspective + rotateY with AnimatePresence

## Database

5 main tables with full Row Level Security:

| Table | Purpose |
|-------|---------|
| `sites` | Poker rooms/sites (presets + custom per-user) |
| `sessions` | Poker sessions with auto-calculated profit |
| `bankroll_snapshots` | Daily per-site balance snapshots |
| `hand_posts` | Hand review posts with tags and visibility |
| `hand_comments` | Threaded comments with street anchors |

See `supabase/schema.sql` for the complete schema including enums, indexes, triggers, and RLS policies.
