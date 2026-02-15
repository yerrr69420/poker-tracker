/** Cyber poker theme — blue/green hacker aesthetic */
export const colors = {
  // Background layers
  bgDeep: '#0a0e1a',
  bgSurface: '#111827',
  bgCard: '#1a2236',
  bgElevated: '#1f2b3d',

  // Felt green (table background)
  feltGreen: '#0d4b2e',
  feltDark: '#0a3822',

  // Primary — Neon cyan/blue (main accent)
  primary: '#00e5ff',
  primaryDim: '#0097a7',
  primaryGlow: 'rgba(0, 229, 255, 0.25)',

  // Secondary — Electric green (profit / positive)
  profit: '#00ff87',
  profitDim: '#00c853',
  profitGlow: 'rgba(0, 255, 135, 0.25)',

  // Danger — Neon red (loss / negative)
  loss: '#ff1744',
  lossDim: '#d50000',
  lossGlow: 'rgba(255, 23, 68, 0.25)',

  // Warning — Amber
  warning: '#ffab00',
  warningDim: '#ff8f00',

  // Text
  textPrimary: '#e8eaf6',
  textSecondary: '#90a4ae',
  textMuted: '#546e7a',
  textInverse: '#0a0e1a',

  // Card suits (4-color deck)
  suitSpades: '#e8eaf6',    // white
  suitHearts: '#ff1744',    // red
  suitDiamonds: '#2979ff',  // blue
  suitClubs: '#00c853',     // green

  // Borders / dividers
  border: '#263238',
  borderLight: '#37474f',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
