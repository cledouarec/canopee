import { describe, expect, it } from 'vitest';
import type { ResolvedState, Taxonomy } from '@/model/types';
import { computeMetrics } from './compute';

const taxonomy: Taxonomy = {
  colorBy: 'topology',
  dimensions: {
    topology: {
      label: 'Type',
      values: {
        'stream-aligned': '#cfe7ab',
        platform: '#aed8cb',
        enabling: '#d6ead0',
      },
    },
  },
  relationshipTypes: {},
};

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'A', tags: { topology: 'stream-aligned' }, headcount: { dev: 6 } },
    { id: 't-2', name: 'B', tags: { topology: 'platform' }, headcount: { dev: 12 } },
    { id: 't-3', name: 'C', tags: { topology: 'stream-aligned' }, headcount: { dev: 3 } },
    { id: 't-4', name: 'D', tags: {}, headcount: {} },
  ],
  relationships: [
    { id: 'r-1', source: 't-1', target: 't-2', type: 'x', directed: true },
    { id: 'r-2', source: 't-3', target: 't-2', type: 'x', directed: true },
    { id: 'r-3', source: 't-1', target: 't-3', type: 'x', directed: true },
  ],
};

describe('computeMetrics — team size', () => {
  it('computes sizes, mean, median and the out-of-5–9 list', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.teamCount).toBe(4);
    expect(m.teamSize.sizes).toEqual({ 't-1': 6, 't-2': 12, 't-3': 3, 't-4': 0 });
    expect(m.teamSize.mean).toBeCloseTo((6 + 12 + 3 + 0) / 4);
    expect(m.teamSize.median).toBeCloseTo(4.5);
    expect(m.teamSize.outOfRange.sort()).toEqual(['t-2', 't-3', 't-4']);
  });
});

describe('computeMetrics — communication load', () => {
  it('uses n·(n−1)/2 on team size and flags teams above the threshold', () => {
    const m = computeMetrics(state, taxonomy, { communicationThresholdLinks: 36 });
    expect(m.communication.perTeam['t-1']).toBe((6 * 5) / 2);
    expect(m.communication.perTeam['t-2']).toBe((12 * 11) / 2);
    expect(m.communication.overloaded).toEqual(['t-2']);
  });
});

describe('computeMetrics — coupling', () => {
  it('computes degree, isolated and most-connected teams', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.coupling.degree).toEqual({ 't-1': 2, 't-2': 2, 't-3': 2, 't-4': 0 });
    expect(m.coupling.isolated).toEqual(['t-4']);
    expect(m.coupling.mostConnected.sort()).toEqual(['t-1', 't-2', 't-3']);
  });
});

describe('computeMetrics — dependency depth', () => {
  it('returns the longest directed path length (edges)', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.dependencyDepth).toBe(2);
  });

  it('counts a simple path that passes through cycle members (regression)', () => {
    // A→B→C→A is a cycle; E→C and B→X→Y exit it.
    // Longest simple path: E→C→A→B→X→Y = 5 edges.
    const g: ResolvedState = {
      teams: ['A', 'B', 'C', 'X', 'Y', 'E'].map((id) => ({
        id,
        name: id,
        tags: {},
        headcount: {},
      })),
      relationships: [
        { id: 'e1', source: 'A', target: 'B', type: 'x', directed: true },
        { id: 'e2', source: 'B', target: 'C', type: 'x', directed: true },
        { id: 'e3', source: 'C', target: 'A', type: 'x', directed: true },
        { id: 'e4', source: 'B', target: 'X', type: 'x', directed: true },
        { id: 'e5', source: 'X', target: 'Y', type: 'x', directed: true },
        { id: 'e6', source: 'E', target: 'C', type: 'x', directed: true },
      ],
    };
    expect(computeMetrics(g, taxonomy).dependencyDepth).toBe(5);
  });

  it('stays finite on a cycle', () => {
    const cyclic: ResolvedState = {
      teams: [
        { id: 'a', name: 'a', tags: {}, headcount: {} },
        { id: 'b', name: 'b', tags: {}, headcount: {} },
      ],
      relationships: [
        { id: 'e1', source: 'a', target: 'b', type: 'x', directed: true },
        { id: 'e2', source: 'b', target: 'a', type: 'x', directed: true },
      ],
    };
    const m = computeMetrics(cyclic, taxonomy);
    expect(Number.isFinite(m.dependencyDepth)).toBe(true);
  });
});

describe('computeMetrics — distribution & Team Topologies', () => {
  it('counts teams per dimension value with an uncategorized bucket', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.distribution.byDimension.topology).toEqual({
      'stream-aligned': 2,
      platform: 1,
      uncategorized: 1,
    });
  });

  it('computes the Team-Topologies stream-aligned ratio', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.teamTopologies.present).toBe(true);
    expect(m.teamTopologies.streamAlignedPct).toBeCloseTo((2 / 4) * 100);
  });
});

describe('computeMetrics — cognitive load & alerts', () => {
  it('cognitive load = size + outgoing dependencies', () => {
    const m = computeMetrics(state, taxonomy, { cognitiveThreshold: 10 });
    expect(m.cognitiveLoad.perTeam['t-1']).toBe(6 + 2);
    expect(m.cognitiveLoad.perTeam['t-2']).toBe(12 + 0);
    expect(m.cognitiveLoad.overloaded).toContain('t-2');
  });

  it('emits actionable alerts', () => {
    const m = computeMetrics(state, taxonomy);
    expect(m.alerts.some((a) => a.includes('t-4') || a.includes('D'))).toBe(true);
    expect(m.alerts.length).toBeGreaterThan(0);
  });

  it('handles an empty state without throwing', () => {
    const m = computeMetrics({ teams: [], relationships: [] }, taxonomy);
    expect(m.teamCount).toBe(0);
    expect(m.teamSize.mean).toBe(0);
    expect(m.teamSize.median).toBe(0);
    expect(m.dependencyDepth).toBe(0);
    expect(m.alerts).toEqual([]);
  });
});
