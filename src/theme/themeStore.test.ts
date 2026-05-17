import { describe, it, expect } from 'vitest';
import { createThemeStore } from './themeStore';
import { MemoryStorage } from '@/store';
import { buildCustomTheme } from './customTheme';

describe('theme store', () => {
  it('defaults to sage-light when storage is empty', () => {
    const s = createThemeStore(new MemoryStorage(), false);
    expect(s.getState().theme.id).toBe('sage-light');
    expect(s.getState().reducedTransparency).toBe(false);
  });

  it('selecting a builtin theme updates and persists it', () => {
    const storage = new MemoryStorage();
    const s = createThemeStore(storage, false);
    s.getState().selectBuiltin('dusk-dark');
    expect(s.getState().theme.id).toBe('dusk-dark');
    expect(createThemeStore(storage, false).getState().theme.id).toBe('dusk-dark');
  });

  it('toggleTheme flips between the light and dark theme and persists', () => {
    const storage = new MemoryStorage();
    const s = createThemeStore(storage, false);
    expect(s.getState().theme.id).toBe('sage-light');
    s.getState().toggleTheme();
    expect(s.getState().theme.id).toBe('dusk-dark');
    expect(createThemeStore(storage, false).getState().theme.id).toBe('dusk-dark');
    s.getState().toggleTheme();
    expect(s.getState().theme.id).toBe('sage-light');
  });

  it('ignores an unknown builtin id', () => {
    const s = createThemeStore(new MemoryStorage(), false);
    s.getState().selectBuiltin('nope');
    expect(s.getState().theme.id).toBe('sage-light');
  });

  it('setting a custom theme persists and restores it', () => {
    const storage = new MemoryStorage();
    const s = createThemeStore(storage, false);
    s.getState().setCustom(buildCustomTheme({ base: 'dark', accent: '#abcdef' }));
    expect(s.getState().theme.id).toBe('custom');
    expect(createThemeStore(storage, false).getState().theme.tokens.accent).toBe('#abcdef');
  });

  it('honors the reduced-transparency flag passed at creation', () => {
    expect(createThemeStore(new MemoryStorage(), true).getState().reducedTransparency).toBe(true);
  });
});
