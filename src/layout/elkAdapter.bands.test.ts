import { describe, it, expect } from 'vitest';
import { computeLayout } from './elkAdapter';
import type { ResolvedState, Taxonomy } from '@/model/types';

const taxonomy: Taxonomy = {
  colorBy: 'topology',
  dimensions: {
    topology: {
      label: 'Type',
      values: { platform: '#aed8cb', 'stream-aligned': '#cfe7ab' },
    },
  },
  relationshipTypes: {},
};

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'A', tags: { topology: 'platform' }, headcount: {} },
    { id: 't-2', name: 'B', tags: { topology: 'stream-aligned' }, headcount: {} },
    { id: 't-3', name: 'C', tags: { topology: 'platform' }, headcount: {} },
    { id: 't-4', name: 'D', tags: {}, headcount: {} }, // uncategorized band
  ],
  relationships: [],
};

describe('computeLayout — bands', () => {
  it('places teams of the same band on the same row (shared y)', async () => {
    const pos = await computeLayout(state, 'bands', { taxonomy });
    expect(pos.get('t-1')!.y).toBe(pos.get('t-3')!.y); // both platform
    expect(pos.get('t-1')!.y).not.toBe(pos.get('t-2')!.y); // different band
  });

  it('orders teams within a band left to right by increasing x', async () => {
    const pos = await computeLayout(state, 'bands', { taxonomy });
    expect(pos.get('t-1')!.x).toBeLessThan(pos.get('t-3')!.x);
  });

  it('groups teams without a band value into their own row', async () => {
    const pos = await computeLayout(state, 'bands', { taxonomy });
    const ys = new Set([...pos.values()].map((p) => p.y));
    expect(ys.size).toBe(3); // platform, stream-aligned, uncategorized
  });

  it('falls back to free layout when no taxonomy is given', async () => {
    const withPos: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: {}, headcount: {}, position: { x: 5, y: 6 } }],
      relationships: [],
    };
    const pos = await computeLayout(withPos, 'bands');
    expect(pos.get('t-1')).toEqual({ x: 5, y: 6 });
  });
});
