import { useStore } from 'zustand';
import { MemoryStorage, safeLocalStorage } from '@/store';
import { createViewPrefsStore, type ViewPrefsState } from './viewPrefsStore';

const storage = safeLocalStorage() ?? new MemoryStorage();

/** Production singleton view-prefs store. */
export const viewPrefsStore = createViewPrefsStore(storage);

export function useViewPrefs<T>(selector: (s: ViewPrefsState) => T): T {
  return useStore(viewPrefsStore, selector);
}
