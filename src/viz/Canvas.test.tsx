import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { rfCapture } from '@/test/reactFlowMock';
import { resetStores } from '@/test/resetStores';

// Mock React Flow: assert the data model handed to the canvas (spec §12).
vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { Canvas } from './Canvas';
import { canopeeStore } from '@/store';

beforeEach(() => {
  rfCapture.nodes = undefined;
  rfCapture.edges = undefined;
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: { dev: 3 } });
    canopeeStore.getState().upsertTeam({ id: 't-2', name: 'B', tags: {}, headcount: { dev: 2 } });
    canopeeStore.getState().upsertRelationship({
      id: 'r-1', source: 't-1', target: 't-2', type: 'collaboration', directed: true,
    });
  });
});
afterEach(() => resetStores());

describe('Canvas', () => {
  it('passes one node per team and one edge per valid relationship', async () => {
    render(<Canvas />);
    await waitFor(() => expect(rfCapture.nodes).toBeDefined());
    expect(rfCapture.nodes).toHaveLength(2);
    expect(rfCapture.edges).toHaveLength(1);
  });

  it('adds an arrowhead to the directed relationship edge', async () => {
    render(<Canvas />);
    await waitFor(() => expect(rfCapture.edges).toBeDefined());
    expect(rfCapture.edges![0].markerEnd).toEqual({ type: 'arrowclosed' });
  });

  it('marks the store-selected team node as selected', async () => {
    act(() => canopeeStore.getState().select({ kind: 'team', id: 't-1' }));
    render(<Canvas />);
    await waitFor(() => expect(rfCapture.nodes).toBeDefined());
    const byId = Object.fromEntries(rfCapture.nodes!.map((n) => [n.id, n.selected]));
    expect(byId['t-1']).toBe(true);
    expect(byId['t-2']).toBeUndefined();
  });

  it('renders an empty graph when there is no org', async () => {
    act(() => {
      canopeeStore.setState({ org: null });
    });
    render(<Canvas />);
    await waitFor(() => expect(rfCapture.nodes).toBeDefined());
    expect(rfCapture.nodes).toHaveLength(0);
    expect(rfCapture.edges).toHaveLength(0);
  });
});
