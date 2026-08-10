/**
 * Brand palette — verified Tipmaster product tokens (tipmaster.net CSS,
 * fetched 2026-08-10). Mirrored as CSS variables in `index.css` (@theme);
 * this TS export is for JS-side use (e.g. confetti colors, canvas).
 */
export const tokens = {
  amber: '#f59e0b',
  amberDark: '#d97706',
  amberLight: '#fde68a',
  ink: '#1e2336',
  blue: '#3b82f6',
  green: '#10b981',
  cyan: '#00e5ff',
  red: '#ff3d00',
} as const;

/** Confetti uses the three badge tones. */
export const confettiColors: readonly string[] = [
  tokens.amber,
  tokens.cyan,
  tokens.red,
] as const;