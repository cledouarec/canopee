import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';
import { themeStore } from '@/theme/useTheme';
import { AppShell } from './AppShell';

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
