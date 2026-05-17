import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StateDiff } from '@/scenarios/diff';
import { ComparisonSummary } from './ComparisonSummary';

const diff: StateDiff = {
  teams: { added: ['t-3'], removed: ['t-2'], modified: ['t-1'], unchanged: [] },
  relationships: { added: [], removed: ['r-1'] },
  summary: {
    teamsAdded: 1,
    teamsRemoved: 1,
    teamsModified: 1,
    relationshipsAdded: 0,
    relationshipsRemoved: 1,
  },
};

describe('ComparisonSummary', () => {
  it('shows the five counters', () => {
    render(<ComparisonSummary diff={diff} />);
    expect(screen.getByText('Teams added')).toBeInTheDocument();
    expect(screen.getByTestId('count-teamsAdded').textContent).toBe('1');
    expect(screen.getByTestId('count-relationshipsRemoved').textContent).toBe('1');
  });

  it('lists the changed entity ids', () => {
    render(<ComparisonSummary diff={diff} />);
    expect(screen.getByText('t-3')).toBeInTheDocument();
    expect(screen.getByText('t-2')).toBeInTheDocument();
    expect(screen.getByText('t-1')).toBeInTheDocument();
  });

  it('exports the summary via a download click', () => {
    // jsdom does not implement the object-URL APIs; install stubs.
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    const u = URL as unknown as Record<string, unknown>;
    const prevCreate = u.createObjectURL;
    const prevRevoke = u.revokeObjectURL;
    u.createObjectURL = create;
    u.revokeObjectURL = revoke;
    try {
      render(<ComparisonSummary diff={diff} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export summary' }));
      expect(create).toHaveBeenCalled();
      expect(revoke).toHaveBeenCalled();
    } finally {
      u.createObjectURL = prevCreate;
      u.revokeObjectURL = prevRevoke;
    }
  });
});
