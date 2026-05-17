import { describe, it, expect } from 'vitest';
import { createOrg, createScenario, renameScenario, deleteScenario } from './edits';
import { resolveScenario } from '@/scenarios/resolve';
import { CURRENT_SCENARIO_ID } from '@/model/types';

describe('createScenario', () => {
  it('appends an empty scenario and returns its generated id', () => {
    const org0 = createOrg('Acme', 'custom');
    const { org, scenarioId } = createScenario(org0, 'Q3 Reorg');
    expect(scenarioId).toMatch(/^s-/);
    const s = org.scenarios.find((x) => x.id === scenarioId)!;
    expect(s.name).toBe('Q3 Reorg');
    expect(s.teams).toEqual([]);
    expect(s.relationships).toEqual([]);
    // Empty deltas resolve to exactly the current state.
    expect(resolveScenario(org, scenarioId)).toEqual(resolveScenario(org, CURRENT_SCENARIO_ID));
    expect(org0.scenarios).toHaveLength(1); // input untouched
  });

  it('generates distinct ids for successive scenarios', () => {
    const { org, scenarioId: a } = createScenario(createOrg('Acme', 'custom'), 'A');
    const { scenarioId: b } = createScenario(org, 'B');
    expect(a).not.toBe(b);
  });
});

describe('renameScenario', () => {
  it('renames a variant scenario immutably', () => {
    const { org, scenarioId } = createScenario(createOrg('Acme', 'custom'), 'Old');
    const next = renameScenario(org, scenarioId, 'New');
    expect(next.scenarios.find((s) => s.id === scenarioId)!.name).toBe('New');
    expect(org.scenarios.find((s) => s.id === scenarioId)!.name).toBe('Old');
  });

  it('throws for an unknown scenario id', () => {
    expect(() => renameScenario(createOrg('Acme', 'custom'), 'ghost', 'X')).toThrow(/scenario/i);
  });
});

describe('deleteScenario', () => {
  it('removes a variant scenario', () => {
    const { org, scenarioId } = createScenario(createOrg('Acme', 'custom'), 'Tmp');
    const next = deleteScenario(org, scenarioId);
    expect(next.scenarios.some((s) => s.id === scenarioId)).toBe(false);
  });

  it('refuses to delete the current scenario', () => {
    expect(() => deleteScenario(createOrg('Acme', 'custom'), CURRENT_SCENARIO_ID)).toThrow(
      /current/i,
    );
  });

  it('throws for an unknown scenario id', () => {
    expect(() => deleteScenario(createOrg('Acme', 'custom'), 'ghost')).toThrow(/scenario/i);
  });
});
