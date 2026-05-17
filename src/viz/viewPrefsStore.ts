import { createStore, type StoreApi } from 'zustand/vanilla';
import type { StorageLike } from '@/store';
import type { LayoutMode } from '@/layout/types';
import { type ViewPrefs, loadViewPrefs, saveViewPrefs } from './viewPrefs';

export interface ViewPrefsState {
  prefs: ViewPrefs;
  setLayoutMode(mode: LayoutMode): void;
  toggleExpandAll(): void;
  toggleExpanded(teamId: string): void;
}

export type ViewPrefsStore = StoreApi<ViewPrefsState>;

export function createViewPrefsStore(storage: StorageLike): ViewPrefsStore {
  return createStore<ViewPrefsState>()((set, get) => {
    const commit = (prefs: ViewPrefs): void => {
      saveViewPrefs(storage, prefs);
      set({ prefs });
    };
    return {
      prefs: loadViewPrefs(storage),
      setLayoutMode(mode) {
        commit({ ...get().prefs, layoutMode: mode });
      },
      toggleExpandAll() {
        commit({ ...get().prefs, expandAll: !get().prefs.expandAll });
      },
      toggleExpanded(teamId) {
        const cur = get().prefs.expandedTeamIds;
        const next = cur.includes(teamId)
          ? cur.filter((id) => id !== teamId)
          : [...cur, teamId];
        commit({ ...get().prefs, expandedTeamIds: next });
      },
    };
  });
}
