import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InsightsPanel } from './InsightsPanel';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({
      id: 't-1', name: 'Checkout', tags: { topology: 'stream-aligned' }, headcount: { dev: 6 },
    });
    canopeeStore.getState().upsertTeam({
      id: 't-2', name: 'Platform', tags: { topology: 'platform' }, headcount: { dev: 14 },
    });
  });
});
afterEach(() => resetStores());

describe('InsightsPanel', () => {
  it('shows the team count and size stats for the current scenario', () => {
    render(<InsightsPanel />);
    expect(screen.getByLabelText('Insights')).toBeInTheDocument();
    expect(screen.getByTestId('metric-teamCount').textContent).toBe('2');
  });

  it('renders the size bar chart and the distribution donut', () => {
    render(<InsightsPanel />);
    expect(screen.getByRole('img', { name: 'Team size' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Distribution/ })).toBeInTheDocument();
  });

  it('lists at least one design alert for the oversized team', () => {
    render(<InsightsPanel />);
    expect(screen.getByTestId('alerts').textContent).toMatch(/Platform/);
  });

  it('shows a hint when no organization is loaded', () => {
    act(() => canopeeStore.setState({ org: null }));
    render(<InsightsPanel />);
    expect(screen.getByTestId('insights-empty')).toBeInTheDocument();
  });
});
