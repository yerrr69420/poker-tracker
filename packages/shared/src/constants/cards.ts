export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = (typeof RANKS)[number];

export const SUITS = ['s', 'h', 'd', 'c'] as const;
export type Suit = (typeof SUITS)[number];

export const SUIT_NAMES: Record<Suit, string> = {
  s: 'Spades',
  h: 'Hearts',
  d: 'Diamonds',
  c: 'Clubs',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '\u2660', // ♠
  h: '\u2665', // ♥
  d: '\u2666', // ♦
  c: '\u2663', // ♣
};

/** 4-color deck: spades black, hearts red, diamonds blue, clubs green */
export const SUIT_COLORS: Record<Suit, string> = {
  s: '#1a1a1a', // spades — black
  h: '#e53935', // hearts — red
  d: '#1e88e5', // diamonds — blue
  c: '#43a047', // clubs — green
};

export interface Card {
  rank: Rank;
  suit: Suit;
}

/** Parse "Ah" → { rank: 'A', suit: 'h' } */
export function parseCard(str: string): Card | null {
  if (str.length !== 2) return null;
  const rank = str[0].toUpperCase() as Rank;
  const suit = str[1].toLowerCase() as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return { rank, suit };
}

/** Parse "AhKs" → [Card, Card] */
export function parseCards(str: string): Card[] {
  const cards: Card[] = [];
  const cleaned = str.replace(/\s+/g, '');
  for (let i = 0; i < cleaned.length - 1; i += 2) {
    const card = parseCard(cleaned.substring(i, i + 2));
    if (card) cards.push(card);
  }
  return cards;
}

/** Card → display string "A♠" */
export function cardToDisplay(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}
