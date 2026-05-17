import { describe, it, expect } from 'vitest';
import { computeLayout } from './elkAdapter';
import type { ResolvedState } from '@/model/types';

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'A', tags: {}, headcount: {}, position: { x: 10, y: 20 } },
    { id: 't-2', name: 'B', tags: {}, headcount: {} }, // no position
  ],
  relationships: [],
};

describe('computeLayout — free', () => {
  it('uses each team stored position, defaulting missing to origin', async () => {
    const pos = await computeLayout(state, 'free');
    expect(pos.get('t-1')).toEqual({ x: 10, y: 20 });
    expect(pos.get('t-2')).toEqual({ x: 0, y: 0 });
  });

  it('returns a position for every team', async () => {
    const pos = await computeLayout(state, 'free');
    expect([...pos.keys()].sort()).toEqual(['t-1', 't-2']);
  });
});
