import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { AppShell } from './AppShell';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';

afterEach(() => resetStores());

describe('AppShell welcome routing', () => {
  beforeEach(() => {
    act(() => canopeeStore.setState({ org: null }));
  });

  it('shows the welcome screen when no org is loaded', () => {
    render(<AppShell />);
    expect(screen.getByTestId('welcome')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('shows the full shell once an org exists', () => {
    render(<AppShell />);
    act(() => canopeeStore.getState().newOrg('Acme', 'team-topologies'));
    expect(screen.queryByTestId('welcome')).toBeNull();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
