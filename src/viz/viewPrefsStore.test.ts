import { describe, it, expect } from 'vitest';
import { createViewPrefsStore } from './viewPrefsStore';
import { loadViewPrefs } from './viewPrefs';
import { MemoryStorage } from '@/store';

describe('view-prefs store', () => {
  it('seeds from storage defaults', () => {
    const s = createViewPrefsStore(new MemoryStorage());
    expect(s.getState().prefs.layoutMode).toBe('free');
    expect(s.getState().prefs.expandAll).toBe(false);
  });

  it('setLayoutMode updates and persists', () => {
    const storage = new MemoryStorage();
    const s = createViewPrefsStore(storage);
    s.getState().setLayoutMode('tb');
    expect(s.getState().prefs.layoutMode).toBe('tb');
    expect(loadViewPrefs(storage).layoutMode).toBe('tb');
  });

  it('toggleExpandAll flips and persists', () => {
    const storage = new MemoryStorage();
    const s = createViewPrefsStore(storage);
    s.getState().toggleExpandAll();
    expect(s.getState().prefs.expandAll).toBe(true);
    expect(loadViewPrefs(storage).expandAll).toBe(true);
  });

  it('toggleExpanded adds then removes a team id', () => {
    const s = createViewPrefsStore(new MemoryStorage());
    s.getState().toggleExpanded('t-1');
    expect(s.getState().prefs.expandedTeamIds).toEqual(['t-1']);
    s.getState().toggleExpanded('t-1');
    expect(s.getState().prefs.expandedTeamIds).toEqual([]);
  });
});
