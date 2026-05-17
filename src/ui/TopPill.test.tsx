import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';
import { themeStore } from '@/theme/useTheme';
import { TopPill } from './TopPill';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
  });
});
afterEach(() => resetStores());

describe('TopPill', () => {
  it('shows the org name and renames via the input', () => {
    render(<TopPill />);
    const input = screen.getByLabelText('Organization name') as HTMLInputElement;
    expect(input.value).toBe('Acme');
    fireEvent.change(input, { target: { value: 'Globex' } });
    expect(canopeeStore.getState().org!.name).toBe('Globex');
  });

  it('lists scenarios and switches the selected one', () => {
    let id = '';
    act(() => {
      id = canopeeStore.getState().addScenario('Q3');
    });
    render(<TopPill />);
    fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: id } });
    expect(canopeeStore.getState().selectedScenarioId).toBe(id);
  });

  it('changes the colorBy dimension', () => {
    render(<TopPill />);
    fireEvent.change(screen.getByLabelText('Color by'), { target: { value: 'topology' } });
    expect(canopeeStore.getState().org!.taxonomy.colorBy).toBe('topology');
  });

  it('toggles between the light and dark theme via the sun/moon button', () => {
    render(<TopPill />);
    expect(themeStore.getState().theme.id).toBe('sage-light');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(themeStore.getState().theme.id).toBe('dusk-dark');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(themeStore.getState().theme.id).toBe('sage-light');
  });

  it('disables undo when there is nothing to undo', () => {
    render(<TopPill />);
    expect(screen.getByLabelText('Undo')).toBeDisabled();
  });

  it('exposes an Export button', () => {
    render(<TopPill />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('opens and closes the export image modal', () => {
    render(<TopPill />);
    expect(screen.queryByRole('dialog', { name: 'Export image' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Export image' }));
    expect(screen.getByRole('dialog', { name: 'Export image' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'Export image' })).toBeNull();
  });
});
