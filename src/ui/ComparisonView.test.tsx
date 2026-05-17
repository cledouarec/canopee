import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { ComparisonView } from './ComparisonView';
import { canopeeStore } from '@/store';
import { comparisonStore } from './useComparison';
import { resetStores } from '@/test/resetStores';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({ id: 't-1', name: 'A', tags: {}, headcount: {} });
    canopeeStore.getState().addScenario('Q3');
    comparisonStore.setState({ leftId: 'current', rightId: 'current' });
  });
});
afterEach(() => {
  resetStores();
  comparisonStore.setState({ leftId: 'current', rightId: 'current' });
});

describe('ComparisonView', () => {
  it('renders two graph panels and the summary', () => {
    render(<ComparisonView />);
    expect(screen.getAllByTestId('rf')).toHaveLength(2);
    expect(screen.getByLabelText('Comparison summary')).toBeInTheDocument();
  });

  it('changing the right scenario updates the comparison store', () => {
    render(<ComparisonView />);
    const q3 = canopeeStore.getState().org!.scenarios.find((s) => s.name === 'Q3')!;
    fireEvent.change(screen.getByLabelText('Right scenario'), {
      target: { value: q3.id },
    });
    expect(comparisonStore.getState().rightId).toBe(q3.id);
  });

  it('does not crash when the comparison references a deleted scenario', () => {
    act(() => {
      comparisonStore.setState({ leftId: 'current', rightId: 'ghost-deleted' });
    });
    render(<ComparisonView />);
    // clamped back to current → still renders the two panels, no throw
    expect(screen.getAllByTestId('rf')).toHaveLength(2);
    expect((screen.getByLabelText('Right scenario') as HTMLSelectElement).value).toBe('current');
  });

  it('shows a hint when no org is loaded', () => {
    act(() => canopeeStore.setState({ org: null }));
    render(<ComparisonView />);
    expect(screen.getByTestId('comparison-empty')).toBeInTheDocument();
  });
});
