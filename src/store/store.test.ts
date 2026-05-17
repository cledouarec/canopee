import { describe, expect, it } from 'vitest';
import { CURRENT_SCENARIO_ID } from '@/model/types';
import { resolveScenario } from '@/scenarios/resolve';
import { createCanopeeStore } from './store';

describe('createCanopeeStore — lifecycle & dirty', () => {
  it('starts with no org and is not dirty', () => {
    const s = createCanopeeStore().getState();
    expect(s.org).toBeNull();
    expect(s.dirty).toBe(false);
    expect(s.selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
    expect(s.selectedEntity).toBeNull();
  });

  it('newOrg sets the org, selects current, and marks dirty (unexported)', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'team-topologies');
    const s = store.getState();
    expect(s.org!.name).toBe('Acme');
    expect(s.selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
    expect(s.dirty).toBe(true);
  });

  it('exportOrg returns pretty JSON and clears dirty', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    const json = store.getState().exportOrg();
    expect(json).toContain('\n  "name": "Acme"');
    expect(store.getState().dirty).toBe(false);
  });

  it('importOrg replaces the org from JSON and is not dirty (matches a saved file)', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    const json = store.getState().exportOrg();
    store.getState().importOrg(json.replace('Acme', 'Globex'));
    expect(store.getState().org!.name).toBe('Globex');
    expect(store.getState().dirty).toBe(false);
  });

  it('importOrg throws OrgParseError on invalid content and keeps the current org', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Keep', 'custom');
    expect(() => store.getState().importOrg('{ not json')).toThrow();
    expect(store.getState().org!.name).toBe('Keep');
  });
});

describe('createCanopeeStore — data actions apply to the selected scenario', () => {
  it('upsertTeam targets current by default and marks dirty', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'team-topologies');
    store.getState().exportOrg(); // clear dirty
    store.getState().upsertTeam({ id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 } });
    const s = store.getState();
    expect(resolveScenario(s.org!, CURRENT_SCENARIO_ID).teams).toHaveLength(1);
    expect(s.dirty).toBe(true);
  });

  it('addScenario + selectScenario routes edits to the variant only', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'team-topologies');
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 5 } });
    const id = store.getState().addScenario('Variant');
    store.getState().selectScenario(id);
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 8 } });
    const s = store.getState();
    expect(resolveScenario(s.org!, id).teams[0].headcount.dev).toBe(8);
    expect(resolveScenario(s.org!, CURRENT_SCENARIO_ID).teams[0].headcount.dev).toBe(5);
  });

  it('deleting the selected scenario falls back to current', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    const id = store.getState().addScenario('Tmp');
    store.getState().selectScenario(id);
    store.getState().deleteScenario(id);
    expect(store.getState().selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
  });

  it('select() updates transient view state', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    store.getState().select({ kind: 'team', id: 't-1' });
    expect(store.getState().selectedEntity).toEqual({ kind: 'team', id: 't-1' });
  });
});
