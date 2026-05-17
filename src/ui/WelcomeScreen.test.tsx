import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { WelcomeScreen } from './WelcomeScreen';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';

beforeEach(() => {
  act(() => canopeeStore.setState({ org: null }));
});
afterEach(() => resetStores());

describe('WelcomeScreen', () => {
  it('creates a new org from the name and framework', () => {
    render(<WelcomeScreen />);
    fireEvent.change(screen.getByLabelText('Organization name'), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByLabelText('Framework'), {
      target: { value: 'team-topologies' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create organization' }));
    expect(canopeeStore.getState().org?.name).toBe('Acme');
    expect(canopeeStore.getState().org?.taxonomy.colorBy).toBe('topology');
  });

  it('disables Create until a name is entered', () => {
    render(<WelcomeScreen />);
    expect(screen.getByRole('button', { name: 'Create organization' })).toBeDisabled();
  });

  it('imports a valid .orga.json file', async () => {
    render(<WelcomeScreen />);
    const valid = JSON.stringify({
      schemaVersion: 1,
      name: 'Imported',
      taxonomy: { colorBy: '', dimensions: {}, relationshipTypes: {} },
      teams: [],
      people: [],
      relationships: [],
      scenarios: [{ id: 'current', name: 'Current', teams: [], relationships: [] }],
    });
    const file = new File([valid], 'x.orga.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('Import organization file'), {
      target: { files: [file] },
    });
    await waitFor(() => expect(canopeeStore.getState().org?.name).toBe('Imported'));
  });

  it('shows readable errors for an invalid import and keeps no org', async () => {
    render(<WelcomeScreen />);
    const file = new File(['{ not json'], 'bad.orga.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('Import organization file'), {
      target: { files: [file] },
    });
    await waitFor(() => expect(screen.getByTestId('import-errors')).toBeInTheDocument());
    expect(canopeeStore.getState().org).toBeNull();
  });
});
