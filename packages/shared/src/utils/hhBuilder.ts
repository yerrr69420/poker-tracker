import type { Card } from '../constants/cards';
import { SUIT_SYMBOLS } from '../constants/cards';
import type { GameTypeEnum, SessionFormat } from '../types/database';

export interface ManualHandInput {
  gameType: GameTypeEnum;
  format: SessionFormat;
  stakes: string;
  isLive: boolean;
  siteName?: string;
  heroPosition?: string;
  heroCards: Card[];
  board: Card[];
  potSize?: number;
  description?: string;
  streets?: ManualStreet[];
}

export interface ManualStreet {
  name: string;
  actions: string[];
}

function cardStr(card: Card): string {
  return `${card.rank}${card.suit}`;
}

function cardDisplay(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * Build a hand history text block from manually entered data.
 * Generates a standardized readable format.
 */
export function buildHandHistory(input: ManualHandInput): string {
  const lines: string[] = [];

  // Header
  const site = input.siteName || (input.isLive ? 'Live Game' : 'Online');
  const gameLabel =
    input.gameType === 'NLH' ? "Hold'em No Limit" :
    input.gameType === 'PLO' ? 'Omaha Pot Limit' :
    input.gameType;

  lines.push(`${site} Hand — ${gameLabel} (${input.stakes})`);
  lines.push(`Format: ${input.format === 'tournament' ? 'Tournament' : 'Cash Game'}`);
  lines.push('');

  // Hero cards
  if (input.heroCards.length > 0) {
    const pos = input.heroPosition ? ` (${input.heroPosition})` : '';
    lines.push(`Hero${pos}: [${input.heroCards.map(cardDisplay).join(' ')}]`);
    lines.push('');
  }

  // Streets
  if (input.streets) {
    for (const street of input.streets) {
      if (street.name === 'Flop' && input.board.length >= 3) {
        lines.push(`*** FLOP *** [${input.board.slice(0, 3).map(cardDisplay).join(' ')}]`);
      } else if (street.name === 'Turn' && input.board.length >= 4) {
        lines.push(
          `*** TURN *** [${input.board.slice(0, 3).map(cardDisplay).join(' ')}] [${cardDisplay(input.board[3])}]`
        );
      } else if (street.name === 'River' && input.board.length >= 5) {
        lines.push(
          `*** RIVER *** [${input.board.slice(0, 4).map(cardDisplay).join(' ')}] [${cardDisplay(input.board[4])}]`
        );
      } else {
        lines.push(`*** ${street.name.toUpperCase()} ***`);
      }
      for (const action of street.actions) {
        lines.push(action);
      }
      lines.push('');
    }
  } else if (input.board.length > 0) {
    // No street actions, just show board
    if (input.board.length >= 3) {
      lines.push(`Board: [${input.board.map(cardDisplay).join(' ')}]`);
    }
    lines.push('');
  }

  // Pot
  if (input.potSize) {
    lines.push(`Pot: $${input.potSize.toFixed(2)}`);
    lines.push('');
  }

  // Description
  if (input.description) {
    lines.push('--- Notes ---');
    lines.push(input.description);
  }

  return lines.join('\n');
}

/**
 * Generate the shorthand string for hero hand (for storage).
 * @example heroHandString([{rank:'A',suit:'h'},{rank:'K',suit:'s'}]) → "AhKs"
 */
export function heroHandString(cards: Card[]): string {
  return cards.map(cardStr).join('');
}

/**
 * Generate the shorthand string for board (for storage).
 * @example boardString([...cards]) → "Ah Kd 7c 2s 9h"
 */
export function boardString(cards: Card[]): string {
  return cards.map(cardStr).join(' ');
}
