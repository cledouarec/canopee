import { useMemo, type CSSProperties } from 'react';
import ReactFlow, { Background } from 'reactflow';
import type { ResolvedState } from '@/model/types';
import type { StateDiff } from '@/scenarios/diff';
import { teamStatus, relStatus, type TeamStatus } from './diffModel';
import s from './ComparisonGraph.module.css';

/*
 * Deliberately simpler than the main canvas: the diff view uses React Flow's
 * default nodes (a label + status-coloured border) rather than the custom
 * `TeamNode`, since here only the diff status matters, not the team detail.
 *
 * Shared diff palette — theme tokens (resolved from the themed root these
 * nodes render under), so the colours track the active theme.
 */
const STATUS_COLOR: Record<TeamStatus, string> = {
  added: 'var(--status-added)',
  removed: 'var(--status-removed)',
  modified: 'var(--status-modified)',
  unchanged: 'var(--border)',
};

function nodeStyle(status: TeamStatus): CSSProperties {
  return {
    border: `2px solid ${STATUS_COLOR[status]}`,
    opacity: status === 'removed' ? 0.5 : 1,
  };
}

function edgeStyle(status: TeamStatus): CSSProperties {
  return {
    stroke:
      status === 'removed'
        ? STATUS_COLOR.removed
        : status === 'added'
          ? STATUS_COLOR.added
          : undefined,
    opacity: status === 'removed' ? 0.4 : 1,
  };
}

export interface ComparisonGraphProps {
  state: ResolvedState;
  diff: StateDiff;
}

/** One side of a comparison: nodes/edges tagged with their diff status. */
export function ComparisonGraph({ state, diff }: ComparisonGraphProps): JSX.Element {
  const nodes = useMemo(
    () =>
      state.teams.map((t, i) => {
        const status = teamStatus(diff, t.id);
        return {
          id: t.id,
          position: t.position ?? { x: (i % 4) * 240, y: Math.floor(i / 4) * 140 },
          data: { label: t.name, status },
          className: s.node,
          style: nodeStyle(status),
        };
      }),
    [state, diff],
  );

  const edges = useMemo(
    () =>
      state.relationships.map((r) => {
        const status = relStatus(diff, r.id);
        return {
          id: r.id,
          source: r.source,
          target: r.target,
          data: { status },
          style: edgeStyle(status),
        };
      }),
    [state, diff],
  );

  return (
    <div className={s.wrap}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
      </ReactFlow>
    </div>
  );
}
