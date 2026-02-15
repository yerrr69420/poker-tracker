/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate password strength (min 8 chars) */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/** Validate stakes text format (e.g. "1/2", "2/5", "$55 MTT") */
export function isValidStakes(stakes: string): boolean {
  return stakes.trim().length > 0;
}

/** Validate card string format (e.g. "Ah", "Ks") */
export function isValidCard(card: string): boolean {
  return /^[AKQJT2-9][shdc]$/.test(card);
}

/** Validate hero hand format (e.g. "AhKs") */
export function isValidHeroHand(hand: string): boolean {
  if (hand.length < 4) return false;
  const cleaned = hand.replace(/\s+/g, '');
  // 2 to 5 cards depending on game
  for (let i = 0; i < cleaned.length; i += 2) {
    if (!isValidCard(cleaned.substring(i, i + 2))) return false;
  }
  return true;
}

/** Validate board string (e.g. "Ah Kd 7c" — 0, 3, 4, or 5 cards) */
export function isValidBoard(board: string): boolean {
  if (board.trim().length === 0) return true; // empty is fine
  const cards = board.trim().split(/\s+/);
  if (![3, 4, 5].includes(cards.length)) return false;
  return cards.every(isValidCard);
}

/** Validate that buy-in is positive */
export function isPositiveAmount(amount: number): boolean {
  return amount > 0;
}

/** Validate that end time is after start time */
export function isEndAfterStart(start: string, end: string): boolean {
  return new Date(end).getTime() > new Date(start).getTime();
}
