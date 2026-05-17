import {
  CURRENT_SCENARIO_ID,
  type Organization,
  type Relationship,
  type ResolvedState,
  type Team,
} from '@/model/types';

function upsertById<T extends { id: string }>(base: T[], patches: T[]): T[] {
  const map = new Map(base.map((e) => [e.id, e]));
  for (const p of patches) map.set(p.id, p);
  return [...map.values()];
}

/**
 * Resolves a scenario into its full state: `resolve(current) + deltas`.
 * No chaining: every delta is applied on top of the root state (= `current`).
 * Pure: never mutates the passed organization (deep-clones all entities).
 * Precedence: if an id appears in both upserts and removed*, deletion wins.
 */
export function resolveScenario(org: Organization, scenarioId: string): ResolvedState {
  const baseTeams: Team[] = structuredClone(org.teams);
  const baseRels: Relationship[] = structuredClone(org.relationships);

  if (scenarioId === CURRENT_SCENARIO_ID) {
    return { teams: baseTeams, relationships: baseRels };
  }

  const scenario = org.scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: "${scenarioId}".`);
  }

  const removedTeams = new Set(scenario.removedTeamIds ?? []);
  const removedRels = new Set(scenario.removedRelationshipIds ?? []);

  const teams = upsertById(baseTeams, structuredClone(scenario.teams)).filter(
    (t) => !removedTeams.has(t.id),
  );
  const relationships = upsertById(baseRels, structuredClone(scenario.relationships)).filter(
    (r) => !removedRels.has(r.id),
  );

  return { teams, relationships };
}
