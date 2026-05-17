import { getFramework } from '@/frameworks';
import { newId } from '@/model/ids';
import {
  CURRENT_SCENARIO_ID,
  DEFAULT_ZOOM,
  type Id,
  type Organization,
  type Person,
  type Relationship,
  SCHEMA_VERSION,
  type ScenarioDelta,
  type Team,
} from '@/model/types';

/**
 * Pure, scenario-aware transforms on an `Organization`. Every function returns
 * a NEW organization and never mutates its input. Editing semantics mirror
 * `resolveScenario`: when the selected scenario is `current` the change touches
 * the root state; for a variant it is recorded as a delta (upsert / removed-id)
 * with no chaining.
 */

/** Build a fresh organization from a framework template. */
export function createOrg(name: string, frameworkId: string): Organization {
  const fw = getFramework(frameworkId);
  if (!fw) throw new Error(`Unknown framework: "${frameworkId}".`);
  return {
    schemaVersion: SCHEMA_VERSION,
    name,
    taxonomy: fw.buildTaxonomy(),
    teams: [],
    people: [],
    relationships: [],
    scenarios: [{ id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] }],
    view: { zoom: DEFAULT_ZOOM },
  };
}

export function renameOrg(org: Organization, name: string): Organization {
  return { ...org, name };
}

/** Change the dimension that drives node color (lives in the file, spec §5.1). */
export function setColorBy(org: Organization, dimensionKey: string): Organization {
  return { ...org, taxonomy: { ...org.taxonomy, colorBy: dimensionKey } };
}

function upsertById<T extends { id: Id }>(list: T[], entity: T): T[] {
  const idx = list.findIndex((e) => e.id === entity.id);
  if (idx === -1) return [...list, entity];
  const next = list.slice();
  next[idx] = entity;
  return next;
}

/** Replace one scenario delta by id (immutably). Throws if absent. */
function mapScenario(
  org: Organization,
  scenarioId: Id,
  fn: (s: ScenarioDelta) => ScenarioDelta,
): Organization {
  const idx = org.scenarios.findIndex((s) => s.id === scenarioId);
  if (idx === -1) throw new Error(`Scenario not found: "${scenarioId}".`);
  const scenarios = org.scenarios.slice();
  scenarios[idx] = fn(scenarios[idx]);
  return { ...org, scenarios };
}

export function upsertTeam(org: Organization, scenarioId: Id, team: Team): Organization {
  if (scenarioId === CURRENT_SCENARIO_ID) {
    return { ...org, teams: upsertById(org.teams, team) };
  }
  return mapScenario(org, scenarioId, (s) => ({
    ...s,
    teams: upsertById(s.teams, team),
    removedTeamIds: (s.removedTeamIds ?? []).filter((id) => id !== team.id),
  }));
}

export function removeTeam(org: Organization, scenarioId: Id, teamId: Id): Organization {
  if (scenarioId === CURRENT_SCENARIO_ID) {
    return { ...org, teams: org.teams.filter((t) => t.id !== teamId) };
  }
  const existsInBase = org.teams.some((t) => t.id === teamId);
  return mapScenario(org, scenarioId, (s) => {
    const removed = new Set(s.removedTeamIds ?? []);
    if (existsInBase) removed.add(teamId);
    return {
      ...s,
      teams: s.teams.filter((t) => t.id !== teamId),
      removedTeamIds: [...removed],
    };
  });
}

export function upsertRelationship(
  org: Organization,
  scenarioId: Id,
  rel: Relationship,
): Organization {
  if (scenarioId === CURRENT_SCENARIO_ID) {
    return { ...org, relationships: upsertById(org.relationships, rel) };
  }
  return mapScenario(org, scenarioId, (s) => ({
    ...s,
    relationships: upsertById(s.relationships, rel),
    removedRelationshipIds: (s.removedRelationshipIds ?? []).filter((id) => id !== rel.id),
  }));
}

export function removeRelationship(org: Organization, scenarioId: Id, relId: Id): Organization {
  if (scenarioId === CURRENT_SCENARIO_ID) {
    return {
      ...org,
      relationships: org.relationships.filter((r) => r.id !== relId),
    };
  }
  const existsInBase = org.relationships.some((r) => r.id === relId);
  return mapScenario(org, scenarioId, (s) => {
    const removed = new Set(s.removedRelationshipIds ?? []);
    if (existsInBase) removed.add(relId);
    return {
      ...s,
      relationships: s.relationships.filter((r) => r.id !== relId),
      removedRelationshipIds: [...removed],
    };
  });
}

/** People are org-global (spec §5: no person deltas per scenario). */
export function upsertPerson(org: Organization, person: Person): Organization {
  return { ...org, people: upsertById(org.people, person) };
}

export function removePerson(org: Organization, personId: Id): Organization {
  return { ...org, people: org.people.filter((p) => p.id !== personId) };
}

/** Create an empty variant scenario (empty deltas → resolves to `current`). */
export function createScenario(
  org: Organization,
  name: string,
): { org: Organization; scenarioId: Id } {
  const scenarioId = newId('s');
  const scenario: ScenarioDelta = {
    id: scenarioId,
    name,
    teams: [],
    relationships: [],
  };
  return { org: { ...org, scenarios: [...org.scenarios, scenario] }, scenarioId };
}

export function renameScenario(org: Organization, scenarioId: Id, name: string): Organization {
  return mapScenario(org, scenarioId, (s) => ({ ...s, name }));
}

export function deleteScenario(org: Organization, scenarioId: Id): Organization {
  if (scenarioId === CURRENT_SCENARIO_ID) {
    throw new Error('The "current" scenario cannot be deleted.');
  }
  if (!org.scenarios.some((s) => s.id === scenarioId)) {
    throw new Error(`Scenario not found: "${scenarioId}".`);
  }
  return { ...org, scenarios: org.scenarios.filter((s) => s.id !== scenarioId) };
}
