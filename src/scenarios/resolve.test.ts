import { describe, expect, it } from 'vitest';
import { teamTopologies } from '@/frameworks/teamTopologies';
import { CURRENT_SCENARIO_ID, type Organization, SCHEMA_VERSION } from '@/model/types';
import { resolveScenario } from './resolve';

function org(): Organization {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: 'Acme',
    taxonomy: teamTopologies.buildTaxonomy(),
    teams: [
      { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 } },
      { id: 't-2', name: 'Platform', tags: {}, headcount: { dev: 9 } },
    ],
    people: [],
    relationships: [
      { id: 'r-1', source: 't-1', target: 't-2', type: 'x-as-a-service', directed: true },
    ],
    scenarios: [
      { id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] },
      {
        id: 's-q3',
        name: 'Q3 Reorg',
        teams: [
          { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 7 } },
          { id: 't-3', name: 'Payments', tags: {}, headcount: { dev: 5 } },
        ],
        relationships: [],
        removedTeamIds: ['t-2'],
        removedRelationshipIds: ['r-1'],
      },
    ],
    view: { zoom: 1 },
  };
}

describe('resolveScenario', () => {
  it('returns the root state for the current scenario', () => {
    const r = resolveScenario(org(), CURRENT_SCENARIO_ID);
    expect(r.teams.map((t) => t.id).sort()).toEqual(['t-1', 't-2']);
    expect(r.relationships).toHaveLength(1);
  });

  it('applies upserts and removals for a variant scenario', () => {
    const r = resolveScenario(org(), 's-q3');
    const byId = Object.fromEntries(r.teams.map((t) => [t.id, t]));
    expect(Object.keys(byId).sort()).toEqual(['t-1', 't-3']);
    expect(byId['t-1'].headcount.dev).toBe(7);
    expect(r.relationships).toHaveLength(0);
  });

  it('does not mutate the original organization', () => {
    const o = org();
    resolveScenario(o, 's-q3');
    expect(o.teams.find((t) => t.id === 't-1')!.headcount.dev).toBe(5);
  });

  it('throws on an unknown scenario id', () => {
    expect(() => resolveScenario(org(), 'nope')).toThrow(/scenario/i);
  });

  it('returns deeply independent objects for a variant (no aliasing)', () => {
    const o = org();
    const r = resolveScenario(o, 's-q3');
    const t1 = r.teams.find((t) => t.id === 't-1')!;
    const orig = o.teams.find((t) => t.id === 't-1')!;
    expect(t1).not.toBe(orig);
    t1.headcount.dev = 999;
    expect(o.teams.find((t) => t.id === 't-1')!.headcount.dev).toBe(5);
  });

  it('clones on the current path too (no aliasing of root arrays)', () => {
    const o = org();
    const r = resolveScenario(o, CURRENT_SCENARIO_ID);
    expect(r.teams[0]).not.toBe(o.teams[0]);
    r.teams[0].headcount.dev = 123;
    expect(o.teams[0].headcount.dev).toBe(5);
  });

  it('removal wins when an id is both upserted and removed', () => {
    const o = org();
    const variant = o.scenarios.find((s) => s.id === 's-q3')!;
    variant.removedTeamIds = ['t-2', 't-1'];
    variant.teams = [{ id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 7 } }];
    const r = resolveScenario(o, 's-q3');
    expect(r.teams.map((t) => t.id)).not.toContain('t-1');
  });
});
