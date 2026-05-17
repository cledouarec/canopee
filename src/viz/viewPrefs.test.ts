import { describe, it, expect } from 'vitest';
import { loadViewPrefs, saveViewPrefs, DEFAULT_VIEW_PREFS, VIEW_PREFS_KEY } from './viewPrefs';
import { MemoryStorage } from '@/store';

describe('view preferences', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadViewPrefs(new MemoryStorage())).toEqual(DEFAULT_VIEW_PREFS);
  });

  it('round-trips saved preferences', () => {
    const storage = new MemoryStorage();
    saveViewPrefs(storage, { layoutMode: 'tb', expandAll: true, expandedTeamIds: ['t-1'] });
    expect(loadViewPrefs(storage)).toEqual({
      layoutMode: 'tb',
      expandAll: true,
      expandedTeamIds: ['t-1'],
    });
  });

  it('returns defaults on corrupt JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem(VIEW_PREFS_KEY, '{ broken');
    expect(loadViewPrefs(storage)).toEqual(DEFAULT_VIEW_PREFS);
  });

  it('returns defaults on a structurally invalid payload', () => {
    const storage = new MemoryStorage();
    storage.setItem(VIEW_PREFS_KEY, JSON.stringify({ layoutMode: 'spiral' }));
    expect(loadViewPrefs(storage)).toEqual(DEFAULT_VIEW_PREFS);
  });

  it('saveViewPrefs tolerates a throwing storage', () => {
    const failing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('full');
      },
      removeItem: () => {},
    };
    expect(() => saveViewPrefs(failing, DEFAULT_VIEW_PREFS)).not.toThrow();
  });
});
