import { describe, expect, it } from 'vitest';
import { organizationSchema } from './schema';

const validOrg = {
  schemaVersion: 2,
  name: 'Acme',
  taxonomy: {
    colorBy: 'topology',
    dimensions: { topology: { label: 'Type', values: { 'stream-aligned': '#cfe7ab' } } },
    relationshipTypes: { collaboration: { label: 'Collab', style: 'solid' } },
  },
  teams: [
    {
      id: 't-1',
      name: 'Checkout',
      tags: { topology: 'stream-aligned' },
      headcount: { dev: 5 },
    },
  ],
  people: [],
  relationships: [],
  scenarios: [{ id: 'current', name: 'Current', teams: [], relationships: [] }],
  view: { zoom: 1 },
};

describe('organizationSchema', () => {
  it('accepts a valid organization', () => {
    expect(organizationSchema.safeParse(validOrg).success).toBe(true);
  });

  it('rejects an unknown relationship style', () => {
    const bad = structuredClone(validOrg);
    bad.taxonomy.relationshipTypes.collaboration.style = 'zigzag';
    expect(organizationSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a missing required team name', () => {
    const bad = structuredClone(validOrg);
    delete (bad.teams[0] as Record<string, unknown>).name;
    const res = organizationSchema.safeParse(bad);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].path).toContain('teams');
    }
  });

  it('rejects a negative headcount', () => {
    const bad = structuredClone(validOrg);
    bad.teams[0].headcount.dev = -2;
    expect(organizationSchema.safeParse(bad).success).toBe(false);
  });
});
