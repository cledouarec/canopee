import type { Theme, ThemeBase } from './types';
import { getTheme } from './registry';

export const CUSTOM_THEME_ID = 'custom';

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_ACCENT = '#15c08a';

export interface CustomThemeInput {
  base: ThemeBase;
  accent: string;
}

/**
 * Build a complete custom `Theme`: take the shipped theme of the chosen base
 * as the surface palette and override the accent (validated hex, safe fallback).
 */
export function buildCustomTheme(input: CustomThemeInput): Theme {
  const seed = getTheme(input.base === 'dark' ? 'dusk-dark' : 'sage-light')!;
  const accent = HEX.test(input.accent) ? input.accent : SAFE_ACCENT;
  return {
    id: CUSTOM_THEME_ID,
    label: 'Custom',
    base: input.base,
    tokens: { ...seed.tokens, accent },
  };
}
