import { describe, it, expect } from 'vitest';
import { serializeOrg, parseOrg, OrgParseError } from './serialize';
import { teamTopologies } from '@/frameworks/teamTopologies';
import { SCHEMA_VERSION, CURRENT_SCENARIO_ID, type Organization } from '@/model/types';

function sampleOrg(): Organization {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: 'Acme',
    taxonomy: teamTopologies.buildTaxonomy(),
    teams: [
      { id: 't-1', name: 'Checkout', tags: { topology: 'stream-aligned' }, headcount: { dev: 5 } },
    ],
    people: [],
    relationships: [],
    scenarios: [{ id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] }],
    view: { zoom: 1 },
  };
}

describe('serializeOrg / parseOrg', () => {
  it('round-trips an organization unchanged', () => {
    const org = sampleOrg();
    const json = serializeOrg(org);
    expect(parseOrg(json)).toEqual(org);
  });

  it('pretty-prints with 2-space indentation', () => {
    expect(serializeOrg(sampleOrg())).toContain('\n  "name": "Acme"');
  });

  it('throws OrgParseError with readable issues on invalid JSON content', () => {
    const bad = JSON.stringify({ schemaVersion: 1, name: '' });
    try {
      parseOrg(bad);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(OrgParseError);
      expect((e as OrgParseError).issues.length).toBeGreaterThan(0);
    }
  });

  it('throws OrgParseError on malformed JSON syntax', () => {
    expect(() => parseOrg('{ not json')).toThrow(OrgParseError);
  });

  it('blocks a future schemaVersion via OrgParseError', () => {
    const future = JSON.stringify({ ...sampleOrg(), schemaVersion: SCHEMA_VERSION + 1 });
    expect(() => parseOrg(future)).toThrow(OrgParseError);
  });
});
