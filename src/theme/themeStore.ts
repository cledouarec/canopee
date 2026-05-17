import { createStore, type StoreApi } from 'zustand/vanilla';
import type { StorageLike } from '@/store';
import type { Theme } from './types';
import { DEFAULT_THEME_ID, getTheme, THEMES } from './registry';
import { loadThemePref, saveThemePref } from './persistence';

export interface ThemeState {
  theme: Theme;
  reducedTransparency: boolean;
  selectBuiltin(id: string): void;
  setCustom(theme: Theme): void;
  /** Switch to the shipped theme with the opposite light/dark base. */
  toggleTheme(): void;
}

export type ThemeStore = StoreApi<ThemeState>;

function initialTheme(storage: StorageLike): Theme {
  const pref = loadThemePref(storage);
  if (pref?.kind === 'builtin') return getTheme(pref.id) ?? getTheme(DEFAULT_THEME_ID)!;
  if (pref?.kind === 'custom') return pref.theme;
  return getTheme(DEFAULT_THEME_ID)!;
}

export function createThemeStore(
  storage: StorageLike,
  reducedTransparency: boolean,
): ThemeStore {
  return createStore<ThemeState>()((set) => ({
    theme: initialTheme(storage),
    reducedTransparency,
    selectBuiltin(id) {
      const theme = getTheme(id);
      if (!theme) return;
      saveThemePref(storage, { kind: 'builtin', id });
      set({ theme });
    },
    setCustom(theme) {
      saveThemePref(storage, { kind: 'custom', theme });
      set({ theme });
    },
    toggleTheme() {
      set((s) => {
        const want = s.theme.base === 'light' ? 'dark' : 'light';
        const next = THEMES.find((t) => t.base === want);
        if (!next) return s;
        saveThemePref(storage, { kind: 'builtin', id: next.id });
        return { theme: next };
      });
    },
  }));
}
