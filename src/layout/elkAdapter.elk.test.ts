import { describe, it, expect } from 'vitest';
import { computeLayout } from './elkAdapter';
import type { ResolvedState } from '@/model/types';

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'A', tags: {}, headcount: {} },
    { id: 't-2', name: 'B', tags: {}, headcount: {} },
    { id: 't-3', name: 'C', tags: {}, headcount: {} },
  ],
  relationships: [
    { id: 'r-1', source: 't-1', target: 't-2', type: 'x', directed: true },
    { id: 'r-2', source: 't-2', target: 't-3', type: 'x', directed: true },
  ],
};

describe('computeLayout — elk tb/lr', () => {
  it('assigns a numeric position to every team (tb)', async () => {
    const pos = await computeLayout(state, 'tb');
    expect([...pos.keys()].sort()).toEqual(['t-1', 't-2', 't-3']);
    for (const p of pos.values()) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it('tb flows top→bottom: a depends-on chain increases y', async () => {
    const pos = await computeLayout(state, 'tb');
    expect(pos.get('t-1')!.y).toBeLessThan(pos.get('t-3')!.y);
  });

  it('lr flows left→right: the same chain increases x', async () => {
    const pos = await computeLayout(state, 'lr');
    expect(pos.get('t-1')!.x).toBeLessThan(pos.get('t-3')!.x);
  });

  it('handles an empty graph', async () => {
    const pos = await computeLayout({ teams: [], relationships: [] }, 'tb');
    expect(pos.size).toBe(0);
  });

  it('ignores relationships with a missing endpoint', async () => {
    const broken: ResolvedState = {
      teams: [{ id: 't-1', name: 'A', tags: {}, headcount: {} }],
      relationships: [{ id: 'r', source: 't-1', target: 'gone', type: 'x', directed: true }],
    };
    const pos = await computeLayout(broken, 'tb');
    expect(pos.size).toBe(1);
  });
});
