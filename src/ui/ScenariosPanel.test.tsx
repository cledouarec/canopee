import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScenariosPanel } from './ScenariosPanel';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
  });
});
afterEach(() => resetStores());

describe('ScenariosPanel', () => {
  it('lists the current scenario', () => {
    render(<ScenariosPanel />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('creates a scenario from the name field', () => {
    render(<ScenariosPanel />);
    fireEvent.change(screen.getByLabelText('New scenario name'), {
      target: { value: 'Q3 Reorg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add scenario' }));
    expect(canopeeStore.getState().org!.scenarios.some((s) => s.name === 'Q3 Reorg')).toBe(true);
  });

  it('selects a scenario when its row is clicked', () => {
    let id = '';
    act(() => {
      id = canopeeStore.getState().addScenario('V1');
    });
    render(<ScenariosPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Select scenario V1' }));
    expect(canopeeStore.getState().selectedScenarioId).toBe(id);
  });

  it('deletes a variant scenario', () => {
    let id = '';
    act(() => {
      id = canopeeStore.getState().addScenario('Temp');
    });
    render(<ScenariosPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete scenario Temp' }));
    expect(canopeeStore.getState().org!.scenarios.some((s) => s.id === id)).toBe(false);
  });

  it('does not offer a delete button for the current scenario', () => {
    render(<ScenariosPanel />);
    expect(screen.queryByRole('button', { name: 'Delete scenario Current' })).toBeNull();
  });
});
