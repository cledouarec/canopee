import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { rfCapture } from '@/test/reactFlowMock';
import { resetStores } from '@/test/resetStores';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { Canvas } from './Canvas';
import { canopeeStore } from '@/store';
import { viewPrefsStore } from './useViewPrefs';

beforeEach(() => {
  rfCapture.nodes = undefined;
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: {} });
    viewPrefsStore.setState({
      prefs: { layoutMode: 'free', expandAll: false, expandedTeamIds: [] },
    });
  });
});
afterEach(() => resetStores());

describe('Canvas + reactive view prefs', () => {
  it('re-renders nodes as expanded when expandAll is toggled in the store', async () => {
    render(<Canvas />);
    await waitFor(() => expect(rfCapture.nodes).toBeDefined());
    expect(rfCapture.nodes![0].data.expanded).toBe(false);
    act(() => {
      viewPrefsStore.getState().toggleExpandAll();
    });
    await waitFor(() => expect(rfCapture.nodes![0].data.expanded).toBe(true));
  });
});
