import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';
import { AppShell } from './AppShell';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
  });
});
afterEach(() => resetStores());

describe('AppShell view routing', () => {
  it('shows the graph canvas by default', () => {
    render(<AppShell />);
    expect(screen.getByRole('group', { name: 'Canvas controls' })).toBeInTheDocument();
  });

  it('shows the scenarios panel when the Scenarios rail entry is chosen', () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(screen.getByLabelText('Scenario manager')).toBeInTheDocument();
  });

  it('shows the comparison view when the Comparison rail entry is chosen', () => {
    render(<AppShell />);
    fireEvent.click(screen.getByRole('button', { name: 'Comparison' }));
    expect(screen.getByLabelText('Comparison summary')).toBeInTheDocument();
  });
});
