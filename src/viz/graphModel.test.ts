import { describe, expect, it } from 'vitest';
import type { ResolvedState, Taxonomy, XY } from '@/model/types';
import { UNCATEGORIZED_COLOR } from './colors';
import { buildGraph } from './graphModel';
import type { ViewPrefs } from './viewPrefs';

const taxonomy: Taxonomy = {
  colorBy: 'topology',
  dimensions: { topology: { label: 'Type', values: { platform: '#aed8cb' } } },
  relationshipTypes: { dep: { label: 'Dep', style: 'dashed' } },
};

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'A', tags: { topology: 'platform' }, headcount: {} },
    { id: 't-2', name: 'B', tags: {}, headcount: {} },
  ],
  relationships: [
    { id: 'r-1', source: 't-1', target: 't-2', type: 'dep', directed: true },
    { id: 'r-2', source: 't-1', target: 'ghost', type: 'dep', directed: false },
  ],
};

const positions = new Map<string, XY>([
  ['t-1', { x: 0, y: 0 }],
  ['t-2', { x: 100, y: 50 }],
]);

const prefs = (over: Partial<ViewPrefs> = {}): ViewPrefs => ({
  layoutMode: 'free',
  expandAll: false,
  expandedTeamIds: [],
  ...over,
});

describe('buildGraph', () => {
  it('creates one node per team with color and position', () => {
    const g = buildGraph(state, taxonomy, positions, prefs());
    const n1 = g.nodes.find((n) => n.id === 't-1')!;
    expect(n1.position).toEqual({ x: 0, y: 0 });
    expect(n1.data.color).toBe('#aed8cb');
    expect(g.nodes.find((n) => n.id === 't-2')!.data.color).toBe(UNCATEGORIZED_COLOR);
  });

  it('flags expanded nodes from the view prefs', () => {
    const all = buildGraph(state, taxonomy, positions, prefs({ expandAll: true }));
    expect(all.nodes.every((n) => n.data.expanded)).toBe(true);

    const some = buildGraph(state, taxonomy, positions, prefs({ expandedTeamIds: ['t-2'] }));
    expect(some.nodes.find((n) => n.id === 't-1')!.data.expanded).toBe(false);
    expect(some.nodes.find((n) => n.id === 't-2')!.data.expanded).toBe(true);
  });

  it('defaults a missing position to the origin', () => {
    const g = buildGraph(state, taxonomy, new Map(), prefs());
    expect(g.nodes.find((n) => n.id === 't-1')!.position).toEqual({ x: 0, y: 0 });
  });

  it('emits edges only for relationships whose endpoints both exist', () => {
    const g = buildGraph(state, taxonomy, positions, prefs());
    expect(g.edges.map((e) => e.id)).toEqual(['r-1']);
    expect(g.edges[0].style.strokeDasharray).toBe('6 4');
  });

  it('adds an arrowhead for directed relationships only', () => {
    const g = buildGraph(state, taxonomy, positions, prefs());
    expect(g.edges[0].markerEnd).toEqual({ type: 'arrowclosed' });

    const undirected: ResolvedState = {
      teams: state.teams,
      relationships: [{ id: 'r-3', source: 't-1', target: 't-2', type: 'dep', directed: false }],
    };
    const g2 = buildGraph(undirected, taxonomy, positions, prefs());
    expect(g2.edges[0].markerEnd).toBeUndefined();
  });

  it('reports dangling relationship ids (spec §11 broken refs)', () => {
    const g = buildGraph(state, taxonomy, positions, prefs());
    expect(g.danglingRelationshipIds).toEqual(['r-2']);
  });
});
