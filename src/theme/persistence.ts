import type { StorageLike } from '@/store';
import { getTheme } from './registry';
import type { Theme } from './types';

export const THEME_KEY = 'canopee:theme:v1';

export type ThemePref = { kind: 'builtin'; id: string } | { kind: 'custom'; theme: Theme };

export function saveThemePref(storage: StorageLike, pref: ThemePref): void {
  try {
    storage.setItem(THEME_KEY, JSON.stringify(pref));
  } catch {
    /* non-critical (spec §11) */
  }
}

export function loadThemePref(storage: StorageLike): ThemePref | null {
  let raw: string | null;
  try {
    raw = storage.getItem(THEME_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  let p: unknown;
  try {
    p = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof p !== 'object' || p === null) return null;
  const o = p as Record<string, unknown>;
  if (o.kind === 'builtin' && typeof o.id === 'string' && getTheme(o.id)) {
    return { kind: 'builtin', id: o.id };
  }
  if (
    o.kind === 'custom' &&
    typeof o.theme === 'object' &&
    o.theme !== null &&
    typeof (o.theme as Theme).tokens === 'object'
  ) {
    return { kind: 'custom', theme: o.theme as Theme };
  }
  return null;
}

/** True when the OS asks for reduced transparency; false if unsupported. */
export function prefersReducedTransparency(win: Window | undefined): boolean {
  if (!win || typeof win.matchMedia !== 'function') return false;
  return win.matchMedia('(prefers-reduced-transparency: reduce)').matches;
}
