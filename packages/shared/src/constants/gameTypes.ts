import type { GameTypeEnum } from '../types/database';

export interface GameTypeInfo {
  value: GameTypeEnum;
  label: string;
  description: string;
}

export const GAME_TYPES: GameTypeInfo[] = [
  { value: 'NLH', label: "No-Limit Hold'em", description: "Texas Hold'em with no-limit betting" },
  { value: 'PLO', label: 'Pot-Limit Omaha', description: 'Omaha with 4 hole cards, pot-limit betting' },
  { value: 'PLO5', label: 'PLO-5', description: 'Omaha with 5 hole cards' },
  { value: 'NLO', label: 'No-Limit Omaha', description: 'Omaha with no-limit betting' },
  { value: 'LHE', label: "Limit Hold'em", description: "Hold'em with fixed-limit betting" },
  { value: 'mixed', label: 'Mixed Game', description: 'Rotating game types (H.O.R.S.E., 8-game, etc.)' },
  { value: 'other', label: 'Other', description: 'Other poker variant' },
];

export const GAME_TYPE_MAP: Record<GameTypeEnum, GameTypeInfo> = Object.fromEntries(
  GAME_TYPES.map((gt) => [gt.value, gt])
) as Record<GameTypeEnum, GameTypeInfo>;
