import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { TeamNodeData } from './graphModel';
import { TeamCard } from './TeamCard';
import s from './TeamNode.module.css';

export type { TeamNodeData };

/**
 * React Flow custom node: a TeamCard plus connection handles. Memoized and
 * driven by React Flow's native `selected` prop (selection lives in the
 * Canopée store and is applied to nodes by the canvas).
 */
export const TeamNode = memo(function TeamNode({
  data,
  selected,
}: NodeProps<TeamNodeData>): JSX.Element {
  return (
    <div className={selected ? s.selected : s.wrap}>
      <Handle type="target" position={Position.Top} />
      <TeamCard team={data.team} color={data.color} expanded={data.expanded} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
