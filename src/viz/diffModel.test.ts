import { describe, it, expect } from 'vitest';
import {
  compareScenarios,
  teamStatus,
  relStatus,
  comparisonSummaryText,
} from './diffModel';
import { CURRENT_SCENARIO_ID, type Organization } from '@/model/types';
import { teamTopologies } from '@/frameworks/teamTopologies';

function org(): Organization {
  return {
    schemaVersion: 1,
    name: 'Acme',
    taxonomy: teamTopologies.buildTaxonomy(),
    teams: [
      { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 5 } },
      { id: 't-2', name: 'Platform', tags: {}, headcount: { dev: 9 } },
    ],
    people: [],
    relationships: [
      { id: 'r-1', source: 't-1', target: 't-2', type: 'x-as-a-service', directed: true },
    ],
    scenarios: [
      { id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] },
      {
        id: 's-q3',
        name: 'Q3',
        teams: [
          { id: 't-1', name: 'Checkout', tags: {}, headcount: { dev: 7 } },
          { id: 't-3', name: 'Payments', tags: {}, headcount: { dev: 4 } },
        ],
        relationships: [],
        removedTeamIds: ['t-2'],
        removedRelationshipIds: ['r-1'],
      },
    ],
    view: { zoom: 1 },
  };
}

describe('compareScenarios', () => {
  it('resolves both sides and diffs current → variant', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-q3');
    expect(c.left.teams.map((t) => t.id).sort()).toEqual(['t-1', 't-2']);
    expect(c.right.teams.map((t) => t.id).sort()).toEqual(['t-1', 't-3']);
    expect(c.diff.summary).toEqual({
      teamsAdded: 1,
      teamsRemoved: 1,
      teamsModified: 1,
      relationshipsAdded: 0,
      relationshipsRemoved: 1,
    });
  });
});

describe('teamStatus / relStatus', () => {
  it('classifies each team against the diff', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-q3');
    expect(teamStatus(c.diff, 't-3')).toBe('added');
    expect(teamStatus(c.diff, 't-2')).toBe('removed');
    expect(teamStatus(c.diff, 't-1')).toBe('modified');
    expect(teamStatus(c.diff, 'unknown')).toBe('unchanged');
  });

  it('classifies relationships', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-q3');
    expect(relStatus(c.diff, 'r-1')).toBe('removed');
    expect(relStatus(c.diff, 'nope')).toBe('unchanged');
  });
});

describe('comparisonSummaryText', () => {
  it('produces a readable, exportable summary', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-q3');
    const text = comparisonSummaryText(c.diff);
    expect(text).toContain('Teams added: 1');
    expect(text).toContain('Teams removed: 1');
    expect(text).toContain('Teams modified: 1');
    expect(text).toContain('Relationships removed: 1');
  });
});
