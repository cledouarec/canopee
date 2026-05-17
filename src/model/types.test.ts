import { describe, expect, it } from 'vitest';
import { CURRENT_SCENARIO_ID, type Organization, SCHEMA_VERSION } from './types';

describe('model constants', () => {
  it('exposes the schema version and current scenario id', () => {
    expect(SCHEMA_VERSION).toBe(2);
    expect(CURRENT_SCENARIO_ID).toBe('current');
  });

  it('allows building a minimal organization', () => {
    const org: Organization = {
      schemaVersion: SCHEMA_VERSION,
      name: 'Acme',
      taxonomy: { colorBy: 'topology', dimensions: {}, relationshipTypes: {} },
      teams: [],
      people: [],
      relationships: [],
      scenarios: [{ id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] }],
      view: { zoom: 1 },
    };
    expect(org.scenarios[0].id).toBe('current');
  });
});
