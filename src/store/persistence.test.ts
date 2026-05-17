import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MemoryStorage,
  debounce,
  loadWorkspace,
  saveWorkspace,
  WORKSPACE_KEY,
  type StorageLike,
} from './persistence';
import { teamTopologies } from '@/frameworks/teamTopologies';
import { SCHEMA_VERSION, CURRENT_SCENARIO_ID, type Organization } from '@/model/types';

function sampleOrg(): Organization {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: 'Acme',
    taxonomy: teamTopologies.buildTaxonomy(),
    teams: [{ id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 } }],
    people: [],
    relationships: [],
    scenarios: [{ id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] }],
    view: { zoom: 1 },
  };
}

describe('MemoryStorage', () => {
  it('behaves like a minimal Storage', () => {
    const s = new MemoryStorage();
    expect(s.getItem('k')).toBeNull();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    s.removeItem('k');
    expect(s.getItem('k')).toBeNull();
  });
});

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('invokes once after the quiet period with the latest args', () => {
    const spy = vi.fn();
    const d = debounce(spy, 100);
    d(1);
    d(2);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('flush() runs the pending call immediately', () => {
    const spy = vi.fn();
    const d = debounce(spy, 100);
    d('x');
    d.flush();
    expect(spy).toHaveBeenCalledWith('x');
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1); // not called again
  });

  it('cancel() drops the pending call', () => {
    const spy = vi.fn();
    const d = debounce(spy, 100);
    d('x');
    d.cancel();
    vi.advanceTimersByTime(100);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('saveWorkspace / loadWorkspace', () => {
  it('round-trips a valid workspace snapshot', () => {
    const storage = new MemoryStorage();
    const ok = saveWorkspace(storage, { org: sampleOrg(), selectedScenarioId: 'current' });
    expect(ok).toBe(true);
    const loaded = loadWorkspace(storage);
    expect(loaded).not.toBeNull();
    expect(loaded!.org).toEqual(sampleOrg());
    expect(loaded!.selectedScenarioId).toBe('current');
  });

  it('returns null when nothing is stored', () => {
    expect(loadWorkspace(new MemoryStorage())).toBeNull();
  });

  it('returns null on corrupt JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem(WORKSPACE_KEY, '{ not json');
    expect(loadWorkspace(storage)).toBeNull();
  });

  it('returns null when the stored org fails schema validation', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      WORKSPACE_KEY,
      JSON.stringify({ org: { schemaVersion: 1, name: '' }, selectedScenarioId: 'current' }),
    );
    expect(loadWorkspace(storage)).toBeNull();
  });

  it('saveWorkspace returns false when the storage throws (quota/full)', () => {
    const failing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
    };
    expect(saveWorkspace(failing, { org: sampleOrg(), selectedScenarioId: 'current' })).toBe(false);
  });
});
