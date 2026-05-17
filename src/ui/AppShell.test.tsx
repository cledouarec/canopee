import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { AppShell } from './AppShell';
import { canopeeStore } from '@/store';
import { themeStore } from '@/theme/useTheme';
import { resetStores } from '@/test/resetStores';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    themeStore.getState().selectBuiltin('sage-light');
  });
});
afterEach(() => resetStores());

describe('AppShell', () => {
  it('renders pill, rail, dock, inspector and the canvas together', () => {
    render(<AppShell />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Views')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Canvas controls' })).toBeInTheDocument();
    expect(screen.getByTestId('rf')).toBeInTheDocument();
  });

  it('applies the active theme CSS vars to its root element', () => {
    render(<AppShell />);
    const root = screen.getByTestId('app-shell');
    expect(root.style.getPropertyValue('--accent')).toBe('#15c08a');
    expect(root.getAttribute('data-theme-base')).toBe('light');
  });

  it('re-applies theme vars when the theme changes', () => {
    render(<AppShell />);
    act(() => {
      themeStore.getState().selectBuiltin('dusk-dark');
    });
    const root = screen.getByTestId('app-shell');
    expect(root.style.getPropertyValue('--accent')).toBe('#1ed79b');
  });
});
