import type { Id, ResolvedState, Taxonomy, Team } from '@/model/types';
import type {
  CognitiveLoadStats,
  CommunicationStats,
  CouplingStats,
  DistributionStats,
  MetricsOptions,
  MetricsReport,
  TeamSizeStats,
  TeamTopologiesRatio,
} from './types';

const UNCATEGORIZED = 'uncategorized';
const SIZE_MIN = 5;
const SIZE_MAX = 9;
const DEFAULT_COMM_THRESHOLD = 36;
const DEFAULT_COGNITIVE_THRESHOLD = 12;

function teamSize(t: Team): number {
  return Object.values(t.headcount).reduce((a, b) => a + b, 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function computeSizes(teams: Team[]): TeamSizeStats {
  const sizes: Record<Id, number> = {};
  for (const t of teams) sizes[t.id] = teamSize(t);
  const values = Object.values(sizes);
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return {
    sizes,
    mean,
    median: median(values),
    outOfRange: teams
      .filter((t) => sizes[t.id] < SIZE_MIN || sizes[t.id] > SIZE_MAX)
      .map((t) => t.id),
  };
}

function communication(
  sizes: Record<Id, number>,
  threshold: number,
): CommunicationStats {
  const perTeam: Record<Id, number> = {};
  for (const [id, n] of Object.entries(sizes)) perTeam[id] = (n * (n - 1)) / 2;
  return {
    perTeam,
    thresholdLinks: threshold,
    overloaded: Object.entries(perTeam)
      .filter(([, links]) => links > threshold)
      .map(([id]) => id),
  };
}

function coupling(state: ResolvedState): CouplingStats {
  const degree: Record<Id, number> = {};
  for (const t of state.teams) degree[t.id] = 0;
  for (const r of state.relationships) {
    if (r.source in degree) degree[r.source] += 1;
    if (r.target in degree) degree[r.target] += 1;
  }
  const values = Object.values(degree);
  const max = values.length ? Math.max(...values) : 0;
  return {
    degree,
    isolated: Object.entries(degree)
      .filter(([, d]) => d === 0)
      .map(([id]) => id),
    mostConnected:
      max === 0
        ? []
        : Object.entries(degree)
            .filter(([, d]) => d === max)
            .map(([id]) => id),
  };
}

/**
 * Longest *simple* directed path length in edges (proxy for org latency).
 * Cycle-safe: a visited node cannot be revisited on the current path, so a
 * cycle never loops yet a path that merely passes through cycle members is
 * still counted (e.g. `E→C→A→B→X→Y` = 5 even if `A→B→C→A` is a cycle).
 *
 * No memoization: a node's best depth depends on the path taken to reach it
 * (which nodes are already used), so caching per node would be unsound. This
 * is exponential in the worst case but org graphs are small and sparse
 * (single-user V1) — an acceptable, documented trade-off.
 */
function dependencyDepth(state: ResolvedState): number {
  const adj = new Map<Id, Id[]>();
  for (const t of state.teams) adj.set(t.id, []);
  for (const r of state.relationships) {
    if (adj.has(r.source) && adj.has(r.target)) {
      (adj.get(r.source) as Id[]).push(r.target);
    }
  }
  const onPath = new Set<Id>();

  function longest(node: Id): number {
    onPath.add(node);
    let depth = 0;
    for (const next of adj.get(node) ?? []) {
      if (onPath.has(next)) continue; // simple path: no repeated node
      depth = Math.max(depth, 1 + longest(next));
    }
    onPath.delete(node);
    return depth;
  }

  let max = 0;
  for (const id of adj.keys()) max = Math.max(max, longest(id));
  return max;
}

function distribution(teams: Team[], taxonomy: Taxonomy): DistributionStats {
  const byDimension: Record<string, Record<string, number>> = {};
  for (const dim of Object.keys(taxonomy.dimensions)) {
    const counts: Record<string, number> = {};
    for (const t of teams) {
      // Unset tag → shared "uncategorized" bucket. A real dimension value
      // literally named "uncategorized" would merge with it (accepted: such a
      // value is degenerate and the taxonomy editor steers away from it).
      const v = t.tags[dim] ?? UNCATEGORIZED;
      counts[v] = (counts[v] ?? 0) + 1;
    }
    byDimension[dim] = counts;
  }
  return { byDimension };
}

function teamTopologies(teams: Team[]): TeamTopologiesRatio {
  const counts: Record<string, number> = {};
  let tagged = 0;
  for (const t of teams) {
    const v = t.tags.topology;
    if (v !== undefined) {
      counts[v] = (counts[v] ?? 0) + 1;
      tagged += 1;
    }
  }
  const total = teams.length;
  // Denominator is ALL teams (not just topology-tagged): "% of the whole org
  // that is stream-aligned", consistent with the <50% design alert.
  return {
    present: tagged > 0,
    counts,
    streamAlignedPct: total === 0 ? 0 : ((counts['stream-aligned'] ?? 0) / total) * 100,
  };
}

function cognitiveLoad(
  state: ResolvedState,
  sizes: Record<Id, number>,
  threshold: number,
): CognitiveLoadStats {
  const out: Record<Id, number> = {};
  for (const t of state.teams) out[t.id] = 0;
  for (const r of state.relationships) {
    if (r.source in out) out[r.source] += 1;
  }
  const perTeam: Record<Id, number> = {};
  for (const t of state.teams) perTeam[t.id] = (sizes[t.id] ?? 0) + out[t.id];
  return {
    perTeam,
    threshold,
    overloaded: Object.entries(perTeam)
      .filter(([, v]) => v > threshold)
      .map(([id]) => id),
  };
}

function buildAlerts(
  state: ResolvedState,
  report: Omit<MetricsReport, 'alerts'>,
): string[] {
  const name = (id: Id): string =>
    state.teams.find((t) => t.id === id)?.name ?? id;
  const alerts: string[] = [];
  for (const id of report.coupling.isolated) {
    alerts.push(`${name(id)} is isolated (no relationships) — potential silo.`);
  }
  for (const id of report.communication.overloaded) {
    alerts.push(`${name(id)} exceeds the team-sized communication threshold.`);
  }
  for (const id of report.cognitiveLoad.overloaded) {
    alerts.push(`${name(id)} has high cognitive load — consider splitting.`);
  }
  if (
    report.teamTopologies.present &&
    report.teamTopologies.streamAlignedPct < 50 &&
    report.teamCount > 0
  ) {
    alerts.push('Fewer than half the teams are stream-aligned.');
  }
  return alerts;
}

/** Pure organisation-design indicators over an already-filtered state. */
export function computeMetrics(
  state: ResolvedState,
  taxonomy: Taxonomy,
  opts: MetricsOptions = {},
): MetricsReport {
  const commThreshold = opts.communicationThresholdLinks ?? DEFAULT_COMM_THRESHOLD;
  const cogThreshold = opts.cognitiveThreshold ?? DEFAULT_COGNITIVE_THRESHOLD;

  const teamSizeStats = computeSizes(state.teams);
  const partial: Omit<MetricsReport, 'alerts'> = {
    teamCount: state.teams.length,
    teamSize: teamSizeStats,
    communication: communication(teamSizeStats.sizes, commThreshold),
    coupling: coupling(state),
    dependencyDepth: dependencyDepth(state),
    distribution: distribution(state.teams, taxonomy),
    teamTopologies: teamTopologies(state.teams),
    cognitiveLoad: cognitiveLoad(state, teamSizeStats.sizes, cogThreshold),
  };
  return { ...partial, alerts: buildAlerts(state, partial) };
}
