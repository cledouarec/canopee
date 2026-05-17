import { useStore } from 'zustand';
import { MemoryStorage, safeLocalStorage } from '@/store';
import { prefersReducedTransparency } from './persistence';
import { createThemeStore, type ThemeState } from './themeStore';

const storage = safeLocalStorage() ?? new MemoryStorage();
const win = typeof window !== 'undefined' ? window : undefined;

/** Production singleton theme store. */
export const themeStore = createThemeStore(storage, prefersReducedTransparency(win));

export function useTheme<T>(selector: (s: ThemeState) => T): T {
  return useStore(themeStore, selector);
}
