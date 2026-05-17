import type { MarkerType } from 'reactflow';
import type { Id, Relationship, ResolvedState, Taxonomy, Team, XY } from '@/model/types';
import { edgeDashArray, relationshipStyle, teamColor } from './colors';
import type { ViewPrefs } from './viewPrefs';

export interface TeamNodeData {
  team: Team;
  color: string;
  expanded: boolean;
}

/** React Flow-ready node. `selected` is applied by the canvas, not here. */
export interface VizNode {
  id: Id;
  type: 'team';
  position: XY;
  data: TeamNodeData;
}

/** React Flow-ready edge: dash from the relationship style, arrow if directed. */
export interface VizEdge {
  id: Id;
  source: Id;
  target: Id;
  style: { strokeDasharray: string | undefined };
  markerEnd?: { type: MarkerType };
}

export interface VizGraph {
  nodes: VizNode[];
  edges: VizEdge[];
  /** Relationships skipped because an endpoint team is missing (spec §11). */
  danglingRelationshipIds: Id[];
}

// `MarkerType.ArrowClosed`. Inlined so this stays a pure module (the value
// import would pull React Flow's runtime into the node-env unit tests).
const ARROW_CLOSED = 'arrowclosed' as MarkerType;

/** Pure projection of a resolved state into the props React Flow consumes. */
export function buildGraph(
  state: ResolvedState,
  taxonomy: Taxonomy,
  positions: Map<Id, XY>,
  prefs: ViewPrefs,
): VizGraph {
  const present = new Set(state.teams.map((t) => t.id));

  const nodes: VizNode[] = state.teams.map((team) => ({
    id: team.id,
    type: 'team',
    position: positions.get(team.id) ?? { x: 0, y: 0 },
    data: {
      team,
      color: teamColor(team, taxonomy),
      expanded: prefs.expandAll || prefs.expandedTeamIds.includes(team.id),
    },
  }));

  const edges: VizEdge[] = [];
  const danglingRelationshipIds: Id[] = [];
  for (const r of state.relationships as Relationship[]) {
    if (present.has(r.source) && present.has(r.target)) {
      edges.push({
        id: r.id,
        source: r.source,
        target: r.target,
        style: { strokeDasharray: edgeDashArray(relationshipStyle(r, taxonomy)) },
        ...(r.directed ? { markerEnd: { type: ARROW_CLOSED } } : {}),
      });
    } else {
      danglingRelationshipIds.push(r.id);
    }
  }

  return { nodes, edges, danglingRelationshipIds };
}
