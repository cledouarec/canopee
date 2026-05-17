import type { LayoutMode } from '@/layout/types';
import type { StorageLike } from '@/store';

/** UI-only view state — NOT persisted in the .orga.json file (spec §7). */
export interface ViewPrefs {
  layoutMode: LayoutMode;
  expandAll: boolean;
  expandedTeamIds: string[];
}

export const DEFAULT_VIEW_PREFS: ViewPrefs = {
  layoutMode: 'free',
  expandAll: false,
  expandedTeamIds: [],
};

export const VIEW_PREFS_KEY = 'canopee:viewprefs:v1';

const LAYOUT_MODES: LayoutMode[] = ['free', 'tb', 'lr', 'bands'];

export function loadViewPrefs(storage: StorageLike): ViewPrefs {
  let raw: string | null;
  try {
    raw = storage.getItem(VIEW_PREFS_KEY);
  } catch {
    return DEFAULT_VIEW_PREFS;
  }
  if (raw === null) return DEFAULT_VIEW_PREFS;

  let p: unknown;
  try {
    p = JSON.parse(raw);
  } catch {
    return DEFAULT_VIEW_PREFS;
  }
  if (typeof p !== 'object' || p === null) return DEFAULT_VIEW_PREFS;

  const o = p as Record<string, unknown>;
  if (!LAYOUT_MODES.includes(o.layoutMode as LayoutMode)) return DEFAULT_VIEW_PREFS;
  if (typeof o.expandAll !== 'boolean') return DEFAULT_VIEW_PREFS;
  if (!Array.isArray(o.expandedTeamIds) || !o.expandedTeamIds.every((x) => typeof x === 'string')) {
    return DEFAULT_VIEW_PREFS;
  }
  return {
    layoutMode: o.layoutMode as LayoutMode,
    expandAll: o.expandAll,
    expandedTeamIds: o.expandedTeamIds as string[],
  };
}

export function saveViewPrefs(storage: StorageLike, prefs: ViewPrefs): void {
  try {
    storage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable/full — view prefs are non-critical (spec §11) */
  }
}
