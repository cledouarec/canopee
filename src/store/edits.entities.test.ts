import { describe, expect, it } from 'vitest';
import { CURRENT_SCENARIO_ID, type Organization, type Team } from '@/model/types';
import { resolveScenario } from '@/scenarios/resolve';
import {
  createOrg,
  removePerson,
  removeRelationship,
  removeTeam,
  upsertPerson,
  upsertRelationship,
  upsertTeam,
} from './edits';

function team(id: string, devs: number): Team {
  return { id, name: id, tags: {}, headcount: { dev: devs } };
}

/** Org with a populated current state plus one empty variant scenario "v". */
function baseOrg(): Organization {
  let org = createOrg('Acme', 'team-topologies');
  org = upsertTeam(org, CURRENT_SCENARIO_ID, team('t-1', 5));
  org = upsertTeam(org, CURRENT_SCENARIO_ID, team('t-2', 9));
  org = upsertRelationship(org, CURRENT_SCENARIO_ID, {
    id: 'r-1',
    source: 't-1',
    target: 't-2',
    type: 'x-as-a-service',
    directed: true,
  });
  return {
    ...org,
    scenarios: [...org.scenarios, { id: 'v', name: 'Variant', teams: [], relationships: [] }],
  };
}

describe('team edits on current', () => {
  it('upsert adds then modifies the root team list', () => {
    let org = baseOrg();
    org = upsertTeam(org, CURRENT_SCENARIO_ID, team('t-1', 7));
    const r = resolveScenario(org, CURRENT_SCENARIO_ID);
    expect(r.teams.find((t) => t.id === 't-1')!.headcount.dev).toBe(7);
    expect(r.teams).toHaveLength(2);
  });

  it('remove deletes from the root team list', () => {
    const org = removeTeam(baseOrg(), CURRENT_SCENARIO_ID, 't-2');
    const r = resolveScenario(org, CURRENT_SCENARIO_ID);
    expect(r.teams.map((t) => t.id)).toEqual(['t-1']);
  });

  it('does not mutate the input organization', () => {
    const org = baseOrg();
    upsertTeam(org, CURRENT_SCENARIO_ID, team('t-1', 99));
    expect(org.teams.find((t) => t.id === 't-1')!.headcount.dev).toBe(5);
  });
});

describe('team edits on a variant scenario (deltas, no chaining)', () => {
  it('modifying a base team is recorded as a delta, current untouched', () => {
    const org = upsertTeam(baseOrg(), 'v', team('t-1', 7));
    expect(resolveScenario(org, 'v').teams.find((t) => t.id === 't-1')!.headcount.dev).toBe(7);
    expect(
      resolveScenario(org, CURRENT_SCENARIO_ID).teams.find((t) => t.id === 't-1')!.headcount.dev,
    ).toBe(5);
  });

  it('removing a base team marks it removed in the variant only', () => {
    const org = removeTeam(baseOrg(), 'v', 't-2');
    expect(resolveScenario(org, 'v').teams.map((t) => t.id)).toEqual(['t-1']);
    expect(
      resolveScenario(org, CURRENT_SCENARIO_ID)
        .teams.map((t) => t.id)
        .sort(),
    ).toEqual(['t-1', 't-2']);
  });

  it('re-upserting a removed base team un-deletes it in the variant', () => {
    let org = removeTeam(baseOrg(), 'v', 't-2');
    org = upsertTeam(org, 'v', team('t-2', 3));
    const r = resolveScenario(org, 'v');
    expect(r.teams.find((t) => t.id === 't-2')!.headcount.dev).toBe(3);
  });

  it('removing a variant-only team just drops the delta (no removed marker needed)', () => {
    let org = upsertTeam(baseOrg(), 'v', team('t-9', 2)); // added only in v
    org = removeTeam(org, 'v', 't-9');
    expect(resolveScenario(org, 'v').teams.some((t) => t.id === 't-9')).toBe(false);
  });

  it('throws when the scenario id does not exist', () => {
    expect(() => upsertTeam(baseOrg(), 'ghost', team('t-x', 1))).toThrow(/scenario/i);
  });
});

describe('relationship edits', () => {
  it('upsert/remove on current mutate the root relationship list', () => {
    let org = baseOrg();
    org = removeRelationship(org, CURRENT_SCENARIO_ID, 'r-1');
    expect(resolveScenario(org, CURRENT_SCENARIO_ID).relationships).toHaveLength(0);
  });

  it('remove on a variant only affects that variant', () => {
    const org = removeRelationship(baseOrg(), 'v', 'r-1');
    expect(resolveScenario(org, 'v').relationships).toHaveLength(0);
    expect(resolveScenario(org, CURRENT_SCENARIO_ID).relationships).toHaveLength(1);
  });
});

describe('person edits (org-global, scenario-independent)', () => {
  it('upsert then remove a person on org.people', () => {
    let org = baseOrg();
    org = upsertPerson(org, { id: 'p-1', name: 'Alice', role: 'TL' });
    expect(org.people).toHaveLength(1);
    org = upsertPerson(org, { id: 'p-1', name: 'Alice', role: 'EM' }); // modify
    expect(org.people[0].role).toBe('EM');
    org = removePerson(org, 'p-1');
    expect(org.people).toHaveLength(0);
  });
});
