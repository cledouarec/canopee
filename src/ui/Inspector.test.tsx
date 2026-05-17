import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';
import { Inspector } from './Inspector';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({
      id: 't-1',
      name: 'Checkout',
      mission: 'Win',
      tags: {},
      headcount: { dev: 4 },
    });
    canopeeStore.getState().select(null);
  });
});
afterEach(() => resetStores());

describe('Inspector', () => {
  it('prompts to select an entity when nothing is selected', () => {
    render(<Inspector />);
    expect(screen.getByText(/select a team/i)).toBeInTheDocument();
  });

  it('commits selected team edits to the store on blur (one undo step per field)', () => {
    act(() => canopeeStore.getState().select({ kind: 'team', id: 't-1' }));
    render(<Inspector />);
    const name = screen.getByLabelText('Team name') as HTMLInputElement;
    expect(name.value).toBe('Checkout');
    fireEvent.change(name, { target: { value: 'Payments' } });
    // not committed until blur (no per-keystroke history pollution)
    expect(canopeeStore.getState().org!.teams.find((t) => t.id === 't-1')!.name).toBe('Checkout');
    fireEvent.blur(name);
    expect(canopeeStore.getState().org!.teams.find((t) => t.id === 't-1')!.name).toBe('Payments');

    const mission = screen.getByLabelText('Mission');
    fireEvent.change(mission, { target: { value: 'Grow' } });
    fireEvent.blur(mission);
    expect(canopeeStore.getState().org!.teams.find((t) => t.id === 't-1')!.mission).toBe('Grow');
  });

  it('shows the inspector form and the merged insights panel together', () => {
    act(() => canopeeStore.getState().select({ kind: 'team', id: 't-1' }));
    render(<Inspector />);
    // No tabs anymore: the team form and the insights metrics coexist.
    expect(screen.getByLabelText('Team name')).toBeInTheDocument();
    expect(screen.getByLabelText('Insights')).toBeInTheDocument();
  });
});
