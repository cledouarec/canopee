import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { AppShell } from './AppShell';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';

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
