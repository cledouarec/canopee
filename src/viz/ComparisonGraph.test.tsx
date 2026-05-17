import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { rfCapture as rf } from '@/test/reactFlowMock';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { ComparisonGraph } from './ComparisonGraph';
import { compareScenarios } from './diffModel';
import { CURRENT_SCENARIO_ID, type Organization } from '@/model/types';
import { teamTopologies } from '@/frameworks/teamTopologies';

function org(): Organization {
  return {
    schemaVersion: 1, name: 'Acme', taxonomy: teamTopologies.buildTaxonomy(),
    teams: [
      { id: 't-1', name: 'A', tags: {}, headcount: {} },
      { id: 't-2', name: 'B', tags: {}, headcount: {} },
    ],
    people: [],
    relationships: [{ id: 'r-1', source: 't-1', target: 't-2', type: 'x', directed: true }],
    scenarios: [
      { id: CURRENT_SCENARIO_ID, name: 'Current', teams: [], relationships: [] },
      {
        id: 's-1', name: 'V', teams: [{ id: 't-1', name: 'A2', tags: {}, headcount: {} }],
        relationships: [], removedTeamIds: ['t-2'], removedRelationshipIds: ['r-1'],
      },
    ],
    view: { zoom: 1 },
  };
}

describe('ComparisonGraph', () => {
  it('decorates left-side nodes with their diff status', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-1');
    render(<ComparisonGraph state={c.left} diff={c.diff} />);
    const byId = Object.fromEntries(rf.nodes!.map((n) => [n.id, n.data.status]));
    expect(byId['t-1']).toBe('modified');
    expect(byId['t-2']).toBe('removed');
  });

  it('decorates right-side added nodes', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-1');
    render(<ComparisonGraph state={c.right} diff={c.diff} />);
    const byId = Object.fromEntries(rf.nodes!.map((n) => [n.id, n.data.status]));
    expect(byId['t-1']).toBe('modified');
  });

  it('marks removed relationships on edges', () => {
    const c = compareScenarios(org(), CURRENT_SCENARIO_ID, 's-1');
    render(<ComparisonGraph state={c.left} diff={c.diff} />);
    expect(rf.edges!.find((e) => e.id === 'r-1')!.data.status).toBe('removed');
  });
});
