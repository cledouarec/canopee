import { describe, it, expect } from 'vitest';
import { createCanopeeStore } from './store';
import { resolveScenario } from '@/scenarios/resolve';
import { CURRENT_SCENARIO_ID } from '@/model/types';

describe('undo / redo', () => {
  it('canUndo/canRedo reflect the history stacks', () => {
    const store = createCanopeeStore();
    expect(store.getState().canUndo).toBe(false);
    store.getState().newOrg('Acme', 'team-topologies');
    expect(store.getState().canUndo).toBe(false); // newOrg resets history
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 5 } });
    expect(store.getState().canUndo).toBe(true);
    expect(store.getState().canRedo).toBe(false);
  });

  it('undo reverts the last edit, redo re-applies it', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'team-topologies');
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 5 } });
    store.getState().undo();
    expect(resolveScenario(store.getState().org!, CURRENT_SCENARIO_ID).teams).toHaveLength(0);
    expect(store.getState().canRedo).toBe(true);
    store.getState().redo();
    expect(resolveScenario(store.getState().org!, CURRENT_SCENARIO_ID).teams).toHaveLength(1);
  });

  it('undo past a deleted scenario reconciles the selection', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    const id = store.getState().addScenario('V');
    store.getState().selectScenario(id);
    store.getState().deleteScenario(id);
    expect(store.getState().selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
    store.getState().undo(); // scenario exists again, but selection stays valid (current)
    expect(store.getState().org!.scenarios.some((s) => s.id === id)).toBe(true);
    expect(store.getState().selectedScenarioId).toBe(CURRENT_SCENARIO_ID);
  });

  it('a new edit after undo clears the redo stack', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 1 } });
    store.getState().undo();
    expect(store.getState().canRedo).toBe(true);
    store.getState().upsertTeam({ id: 't-2', name: 'B', tags: {}, headcount: { dev: 1 } });
    expect(store.getState().canRedo).toBe(false);
  });

  it('undo/redo are no-ops when the stacks are empty', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    store.getState().undo();
    store.getState().redo();
    expect(store.getState().org!.name).toBe('Acme');
  });

  it('undo back to an exported state clears dirty; redo away from it sets dirty', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    store.getState().exportOrg(); // clean baseline = current org
    expect(store.getState().dirty).toBe(false);
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 1 } });
    expect(store.getState().dirty).toBe(true);
    store.getState().undo(); // back to the exported snapshot
    expect(store.getState().dirty).toBe(false);
    store.getState().redo(); // away again
    expect(store.getState().dirty).toBe(true);
  });

  it('undo back to an imported state clears dirty', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    const json = store.getState().exportOrg();
    store.getState().importOrg(json);
    expect(store.getState().dirty).toBe(false);
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 1 } });
    store.getState().undo();
    expect(store.getState().dirty).toBe(false);
  });

  it('a new org never has a clean baseline: undo stays dirty (not exported to a file)', () => {
    const store = createCanopeeStore();
    store.getState().newOrg('Acme', 'custom');
    store.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 1 } });
    store.getState().undo();
    expect(store.getState().dirty).toBe(true);
  });
});
