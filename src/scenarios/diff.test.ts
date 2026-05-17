import { describe, it, expect } from 'vitest';
import { diffStates } from './diff';
import type { ResolvedState } from '@/model/types';

const A: ResolvedState = {
  teams: [
    { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 }, position: { x: 0, y: 0 } },
    { id: 't-2', name: 'Platform', tags: {}, headcount: { dev: 9 } },
  ],
  relationships: [{ id: 'r-1', source: 't-1', target: 't-2', type: 'x-as-a-service', directed: true }],
};

const B: ResolvedState = {
  teams: [
    { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 7 }, position: { x: 99, y: 99 } },
    { id: 't-3', name: 'Payments', tags: {}, headcount: { dev: 5 } },
  ],
  relationships: [],
};

describe('diffStates', () => {
  it('classifies added / removed / modified teams', () => {
    const d = diffStates(A, B);
    expect(d.teams.added).toEqual(['t-3']);
    expect(d.teams.removed).toEqual(['t-2']);
    expect(d.teams.modified).toEqual(['t-1']);
    expect(d.teams.unchanged).toEqual([]);
  });

  it('ignores position-only changes (layout is not a semantic change)', () => {
    const same: ResolvedState = {
      teams: [{ id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 }, position: { x: 1, y: 1 } }],
      relationships: [],
    };
    const moved: ResolvedState = {
      teams: [{ id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 }, position: { x: 500, y: 9 } }],
      relationships: [],
    };
    expect(diffStates(same, moved).teams.modified).toEqual([]);
  });

  it('classifies added / removed relationships', () => {
    const d = diffStates(A, B);
    expect(d.relationships.removed).toEqual(['r-1']);
    expect(d.relationships.added).toEqual([]);
  });

  it('produces summary counts', () => {
    const d = diffStates(A, B);
    expect(d.summary).toEqual({
      teamsAdded: 1,
      teamsRemoved: 1,
      teamsModified: 1,
      relationshipsAdded: 0,
      relationshipsRemoved: 1,
    });
  });

  it('treats parentId null vs absent as unchanged (no false modified)', () => {
    const withNull: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: {}, headcount: {}, parentId: null }],
      relationships: [],
    };
    const withAbsent: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: {}, headcount: {} }],
      relationships: [],
    };
    const d = diffStates(withNull, withAbsent);
    expect(d.teams.modified).toEqual([]);
    expect(d.teams.unchanged).toEqual(['t-1']);
  });

  it('encodes a relationship modification as both removed and added', () => {
    const a: ResolvedState = {
      teams: [],
      relationships: [{ id: 'r-1', source: 's', target: 't', type: 'collaboration', directed: true }],
    };
    const b: ResolvedState = {
      teams: [],
      relationships: [{ id: 'r-1', source: 's', target: 't', type: 'x-as-a-service', directed: true }],
    };
    const d = diffStates(a, b);
    expect(d.relationships.added).toEqual(['r-1']);
    expect(d.relationships.removed).toEqual(['r-1']);
    expect(d.summary.relationshipsAdded).toBe(1);
    expect(d.summary.relationshipsRemoved).toBe(1);
  });

  it('keeps an identical relationship out of added/removed', () => {
    const rel = { id: 'r-1', source: 's', target: 't', type: 'collaboration', directed: true };
    const d = diffStates({ teams: [], relationships: [rel] }, { teams: [], relationships: [{ ...rel }] });
    expect(d.relationships.added).toEqual([]);
    expect(d.relationships.removed).toEqual([]);
  });

  it('is key-order independent for tags/headcount', () => {
    const a: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: { x: '1', y: '2' }, headcount: { dev: 3, pm: 1 } }],
      relationships: [],
    };
    const b: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: { y: '2', x: '1' }, headcount: { pm: 1, dev: 3 } }],
      relationships: [],
    };
    expect(diffStates(a, b).teams.modified).toEqual([]);
    expect(diffStates(a, b).teams.unchanged).toEqual(['t-1']);
  });
});
