export type ThemeBase = 'light' | 'dark';

/** CSS custom-property keys the app styles against (without the `--` prefix). */
export const TOKEN_KEYS = [
  'bg',
  'surface',
  'surfaceGlass',
  'text',
  'muted',
  'border',
  'accent',
  'accentText',
  // Semantic colors (added so no UI/viz component hard-codes a hex).
  'danger',
  'dangerText',
  'error',
  'scrim',
  'panelRim',
  'panelShadow',
  'cardShadow',
  'statusAdded',
  'statusRemoved',
  'statusModified',
] as const;

export type TokenKey = (typeof TOKEN_KEYS)[number];

export interface Theme {
  id: string;
  label: string;
  base: ThemeBase;
  /** value per token key (colors / surface expressions) */
  tokens: Record<TokenKey, string>;
}
