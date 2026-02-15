/** Shadow definitions — platform-agnostic values */
export const shadows = {
  sm: {
    color: 'rgba(0, 0, 0, 0.3)',
    offsetX: 0,
    offsetY: 1,
    blur: 3,
    spread: 0,
  },
  md: {
    color: 'rgba(0, 0, 0, 0.4)',
    offsetX: 0,
    offsetY: 4,
    blur: 6,
    spread: -1,
  },
  lg: {
    color: 'rgba(0, 0, 0, 0.5)',
    offsetX: 0,
    offsetY: 10,
    blur: 15,
    spread: -3,
  },
  neonCyan: {
    color: 'rgba(0, 229, 255, 0.4)',
    offsetX: 0,
    offsetY: 0,
    blur: 15,
    spread: 0,
  },
  neonGreen: {
    color: 'rgba(0, 255, 135, 0.4)',
    offsetX: 0,
    offsetY: 0,
    blur: 15,
    spread: 0,
  },
  neonRed: {
    color: 'rgba(255, 23, 68, 0.4)',
    offsetX: 0,
    offsetY: 0,
    blur: 15,
    spread: 0,
  },
} as const;

export type ShadowToken = keyof typeof shadows;

/** CSS box-shadow string helper */
export function shadowToCSS(key: ShadowToken): string {
  const s = shadows[key];
  return `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
}
