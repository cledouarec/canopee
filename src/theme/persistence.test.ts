import { describe, expect, it } from 'vitest';
import { MemoryStorage } from '@/store';
import { buildCustomTheme } from './customTheme';
import { loadThemePref, prefersReducedTransparency, saveThemePref, THEME_KEY } from './persistence';

describe('theme preference persistence', () => {
  it('returns null when nothing is stored', () => {
    expect(loadThemePref(new MemoryStorage())).toBeNull();
  });

  it('round-trips a built-in theme id', () => {
    const s = new MemoryStorage();
    saveThemePref(s, { kind: 'builtin', id: 'dusk-dark' });
    expect(loadThemePref(s)).toEqual({ kind: 'builtin', id: 'dusk-dark' });
  });

  it('round-trips a custom theme', () => {
    const s = new MemoryStorage();
    const theme = buildCustomTheme({ base: 'dark', accent: '#abcdef' });
    saveThemePref(s, { kind: 'custom', theme });
    expect(loadThemePref(s)).toEqual({ kind: 'custom', theme });
  });

  it('returns null on corrupt / invalid payloads', () => {
    const s = new MemoryStorage();
    s.setItem(THEME_KEY, '{ bad');
    expect(loadThemePref(s)).toBeNull();
    s.setItem(THEME_KEY, JSON.stringify({ kind: 'weird' }));
    expect(loadThemePref(s)).toBeNull();
  });

  it('prefersReducedTransparency is false when matchMedia is unavailable', () => {
    expect(prefersReducedTransparency(undefined)).toBe(false);
  });

  it('prefersReducedTransparency reflects the media query when present', () => {
    const win = { matchMedia: (q: string) => ({ matches: q.includes('reduce') }) };
    expect(prefersReducedTransparency(win as unknown as Window)).toBe(true);
  });
});
