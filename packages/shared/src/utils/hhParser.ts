import type { GameTypeEnum, SessionFormat } from '../types/database';
import { parseCards, type Card } from '../constants/cards';

/**
 * Parsed hand history structure.
 * Designed to handle common online hand history formats.
 */
export interface ParsedHand {
  site?: string;
  gameType?: GameTypeEnum;
  format?: SessionFormat;
  stakes?: string;
  heroName?: string;
  heroCards: Card[];
  board: Card[];
  pot?: number;
  rawText: string;
  streets: ParsedStreet[];
}

export interface ParsedStreet {
  name: string; // 'Preflop' | 'Flop' | 'Turn' | 'River'
  actions: string[];
  cards?: Card[]; // Board cards dealt on this street
}

/**
 * Parse a hand history text into structured data.
 * Handles PokerStars-style format as a starting point.
 */
export function parseHandHistory(text: string): ParsedHand {
  const lines = text.trim().split('\n').map((l) => l.trim());
  const result: ParsedHand = {
    heroCards: [],
    board: [],
    rawText: text,
    streets: [],
  };

  let currentStreet: ParsedStreet | null = null;

  for (const line of lines) {
    // Try to detect site
    if (line.includes('PokerStars')) result.site = 'PokerStars';
    else if (line.includes('GGPoker')) result.site = 'GGPoker';
    else if (line.includes('partypoker')) result.site = 'partypoker';

    // Detect game type from header
    if (line.includes("Hold'em No Limit") || line.includes('NLH'))
      result.gameType = 'NLH';
    else if (line.includes('Omaha Pot Limit') || line.includes('PLO'))
      result.gameType = 'PLO';

    // Detect stakes
    const stakesMatch = line.match(/\(?\$?([\d.]+)\/\$?([\d.]+)/);
    if (stakesMatch && !result.stakes) {
      result.stakes = `${stakesMatch[1]}/${stakesMatch[2]}`;
    }

    // Detect tournament
    if (line.includes('Tournament') || line.includes('Tourney')) {
      result.format = 'tournament';
    }

    // Detect hero cards: "Dealt to HeroName [Ah Ks]"
    const dealtMatch = line.match(/Dealt to (.+?) \[(.+?)\]/);
    if (dealtMatch) {
      result.heroName = dealtMatch[1];
      result.heroCards = parseCards(dealtMatch[2]);
    }

    // Detect streets
    if (line.startsWith('*** HOLE CARDS ***') || line.startsWith('*** PREFLOP ***')) {
      currentStreet = { name: 'Preflop', actions: [] };
      result.streets.push(currentStreet);
      continue;
    }
    const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[(.+?)\]/);
    if (flopMatch) {
      const flopCards = parseCards(flopMatch[1]);
      currentStreet = { name: 'Flop', actions: [], cards: flopCards };
      result.streets.push(currentStreet);
      result.board.push(...flopCards);
      continue;
    }
    const turnMatch = line.match(/\*\*\* TURN \*\*\* .+?\[(.+?)\]/);
    if (turnMatch) {
      const turnCards = parseCards(turnMatch[1]);
      currentStreet = { name: 'Turn', actions: [], cards: turnCards };
      result.streets.push(currentStreet);
      result.board.push(...turnCards);
      continue;
    }
    const riverMatch = line.match(/\*\*\* RIVER \*\*\* .+?\[(.+?)\]/);
    if (riverMatch) {
      const riverCards = parseCards(riverMatch[1]);
      currentStreet = { name: 'River', actions: [], cards: riverCards };
      result.streets.push(currentStreet);
      result.board.push(...riverCards);
      continue;
    }

    // Detect total pot
    const potMatch = line.match(/Total pot:?\s*\$?([\d,.]+)/i);
    if (potMatch) {
      result.pot = parseFloat(potMatch[1].replace(',', ''));
    }

    // Add actions to current street
    if (currentStreet && line.length > 0 && !line.startsWith('***')) {
      currentStreet.actions.push(line);
    }
  }

  // Default format to cash if not detected
  if (!result.format) result.format = 'cash';

  return result;
}
