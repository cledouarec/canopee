import type { Relationship, ResolvedState, Team } from '@/model/types';

export interface EntityDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

export interface RelationshipDiff {
  added: string[];
  removed: string[];
}

export interface DiffSummary {
  teamsAdded: number;
  teamsRemoved: number;
  teamsModified: number;
  relationshipsAdded: number;
  relationshipsRemoved: number;
}

export interface StateDiff {
  teams: EntityDiff;
  relationships: RelationshipDiff;
  summary: DiffSummary;
}

/** Semantic projection of a team: excludes `position` (layout only). */
function teamFingerprint(t: Team): string {
  const { position: _position, ...semantic } = t;
  return JSON.stringify(sortKeysDeep(semantic));
}

function relFingerprint(r: Relationship): string {
  return JSON.stringify(sortKeysDeep(r));
}

/**
 * Deep-sorts object keys for stable JSON serialisation.
 * Also drops keys whose value is null or undefined so that
 * "absent ≡ null ≡ undefined" for fingerprint equality.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .filter((k) => {
          const v = (value as Record<string, unknown>)[k];
          return v !== null && v !== undefined;
        })
        .sort()
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

/**
 * Compares two resolved states (A = before, B = after).
 * Team: added / removed / modified (excluding position) / unchanged.
 * Relationship: added / removed (modification = removed+added).
 */
export function diffStates(a: ResolvedState, b: ResolvedState): StateDiff {
  const aTeams = new Map(a.teams.map((t) => [t.id, t]));
  const bTeams = new Map(b.teams.map((t) => [t.id, t]));

  const teams: EntityDiff = { added: [], removed: [], modified: [], unchanged: [] };
  for (const id of bTeams.keys()) if (!aTeams.has(id)) teams.added.push(id);
  for (const id of aTeams.keys()) if (!bTeams.has(id)) teams.removed.push(id);
  for (const [id, at] of aTeams) {
    const bt = bTeams.get(id);
    if (!bt) continue;
    if (teamFingerprint(at) === teamFingerprint(bt)) teams.unchanged.push(id);
    else teams.modified.push(id);
  }

  const aRels = new Map(a.relationships.map((r) => [r.id, r]));
  const bRels = new Map(b.relationships.map((r) => [r.id, r]));
  const relationships: RelationshipDiff = { added: [], removed: [] };
  for (const [id, br] of bRels) {
    if (!aRels.has(id)) relationships.added.push(id);
    else if (relFingerprint(aRels.get(id)!) !== relFingerprint(br)) {
      relationships.added.push(id);
      relationships.removed.push(id);
    }
  }
  for (const id of aRels.keys()) if (!bRels.has(id)) relationships.removed.push(id);

  return {
    teams,
    relationships,
    summary: {
      teamsAdded: teams.added.length,
      teamsRemoved: teams.removed.length,
      teamsModified: teams.modified.length,
      relationshipsAdded: relationships.added.length,
      relationshipsRemoved: relationships.removed.length,
    },
  };
}
