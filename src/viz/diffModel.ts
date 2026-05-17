import type { Id, Organization, ResolvedState } from '@/model/types';
import { diffStates, type StateDiff } from '@/scenarios/diff';
import { resolveScenario } from '@/scenarios/resolve';

export type TeamStatus = 'added' | 'removed' | 'modified' | 'unchanged';
export type RelStatus = 'added' | 'removed' | 'unchanged';

export interface Comparison {
  left: ResolvedState;
  right: ResolvedState;
  diff: StateDiff;
}

/** Resolve both scenarios and diff left (before) → right (after). */
export function compareScenarios(org: Organization, leftId: Id, rightId: Id): Comparison {
  const left = resolveScenario(org, leftId);
  const right = resolveScenario(org, rightId);
  return { left, right, diff: diffStates(left, right) };
}

export function teamStatus(diff: StateDiff, teamId: Id): TeamStatus {
  if (diff.teams.added.includes(teamId)) return 'added';
  if (diff.teams.removed.includes(teamId)) return 'removed';
  if (diff.teams.modified.includes(teamId)) return 'modified';
  return 'unchanged';
}

export function relStatus(diff: StateDiff, relId: Id): RelStatus {
  if (diff.relationships.added.includes(relId)) return 'added';
  if (diff.relationships.removed.includes(relId)) return 'removed';
  return 'unchanged';
}

/** Human-readable, exportable summary of a comparison. */
export function comparisonSummaryText(diff: StateDiff): string {
  const s = diff.summary;
  return [
    `Teams added: ${s.teamsAdded}`,
    `Teams removed: ${s.teamsRemoved}`,
    `Teams modified: ${s.teamsModified}`,
    `Relationships added: ${s.relationshipsAdded}`,
    `Relationships removed: ${s.relationshipsRemoved}`,
  ].join('\n');
}
