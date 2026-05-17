import { useStore } from 'zustand';
import { safeLocalStorage, MemoryStorage } from '@/store';
import { createThemeStore, type ThemeState } from './themeStore';
import { prefersReducedTransparency } from './persistence';

const storage = safeLocalStorage() ?? new MemoryStorage();
const win = typeof window !== 'undefined' ? window : undefined;

/** Production singleton theme store. */
export const themeStore = createThemeStore(storage, prefersReducedTransparency(win));

export function useTheme<T>(selector: (s: ThemeState) => T): T {
  return useStore(themeStore, selector);
}
