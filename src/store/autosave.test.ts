import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CURRENT_SCENARIO_ID } from '@/model/types';
import { attachAutosave, hydrate } from './autosave';
import { createOrg } from './edits';
import { loadWorkspace, MemoryStorage, saveWorkspace } from './persistence';
import { createCanopeeStore } from './store';

describe('hydrate', () => {
  it('loads a saved workspace into the store and returns true', () => {
    const storage = new MemoryStorage();
    saveWorkspace(storage, { org: createOrg('Saved', 'custom'), selectedScenarioId: 'current' });
    const store = createCanopeeStore();
    expect(hydrate(store, storage)).toBe(true);
    expect(store.getState().org!.name).toBe('Saved');
    expect(store.getState().dirty).toBe(false);
  });

  it('returns false and leaves the store empty when nothing is saved', () => {
    const store = createCanopeeStore();
    expect(hydrate(store, new MemoryStorage())).toBe(false);
    expect(store.getState().org).toBeNull();
  });

  it('reconciles a stale selectedScenarioId to current on load', () => {
    const storage = new MemoryStorage();
    saveWorkspace(storage, {
      org: createOrg('Saved', 'custom'),
      selectedScenarioId: 'deleted-variant',
    });
    const store = createCanopeeStore();
    expect(hydrate(store, storage)).toBe(true);
    expect(store.getState().selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
  });
});

describe('attachAutosave', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('persists the workspace (debounced) after an edit', () => {
    const storage = new MemoryStorage();
    const store = createCanopeeStore();
    attachAutosave(store, storage, 200);
    store.getState().newOrg('Acme', 'custom');
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 1 } });
    expect(loadWorkspace(storage)).toBeNull(); // not yet (debounced)
    vi.advanceTimersByTime(200);
    const ws = loadWorkspace(storage);
    expect(ws!.org.teams).toHaveLength(1);
    expect(ws!.selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
  });

  it('does not write while the org is still null', () => {
    const storage = new MemoryStorage();
    const store = createCanopeeStore();
    attachAutosave(store, storage, 200);
    store.getState().select({ kind: 'team', id: 'x' }); // org still null
    vi.advanceTimersByTime(200);
    expect(loadWorkspace(storage)).toBeNull();
  });

  it('the returned disposer stops further autosaves', () => {
    const storage = new MemoryStorage();
    const store = createCanopeeStore();
    const stop = attachAutosave(store, storage, 200);
    store.getState().newOrg('Acme', 'custom');
    stop();
    vi.advanceTimersByTime(200);
    expect(loadWorkspace(storage)).toBeNull();
  });
});
