import { describe, it, expect } from 'vitest';
import { createOrg, renameOrg, setColorBy } from './edits';
import { SCHEMA_VERSION, CURRENT_SCENARIO_ID } from '@/model/types';

describe('createOrg', () => {
  it('builds an org from a framework with one empty current scenario', () => {
    const org = createOrg('Acme', 'team-topologies');
    expect(org.schemaVersion).toBe(SCHEMA_VERSION);
    expect(org.name).toBe('Acme');
    expect(org.taxonomy.colorBy).toBe('topology');
    expect(org.teams).toEqual([]);
    expect(org.people).toEqual([]);
    expect(org.relationships).toEqual([]);
    expect(org.scenarios).toHaveLength(1);
    expect(org.scenarios[0].id).toBe(CURRENT_SCENARIO_ID);
    expect(org.scenarios[0].teams).toEqual([]);
  });

  it('throws on an unknown framework id', () => {
    expect(() => createOrg('Acme', 'nope')).toThrow(/framework/i);
  });
});

describe('renameOrg', () => {
  it('returns a new org with the new name, original untouched', () => {
    const org = createOrg('Acme', 'custom');
    const renamed = renameOrg(org, 'Globex');
    expect(renamed.name).toBe('Globex');
    expect(org.name).toBe('Acme');
    expect(renamed).not.toBe(org);
  });
});

describe('setColorBy', () => {
  it('updates the taxonomy colorBy dimension immutably', () => {
    const org = createOrg('Acme', 'team-topologies');
    const next = setColorBy(org, 'axis');
    expect(next.taxonomy.colorBy).toBe('axis');
    expect(org.taxonomy.colorBy).toBe('topology');
    expect(next.taxonomy).not.toBe(org.taxonomy);
  });
});
