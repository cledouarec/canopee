import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';
import type { Team } from '@/model/types';

const team: Team = {
  id: 't-1',
  name: 'Checkout',
  icon: 'shopping-cart',
  tags: {},
  headcount: { dev: 5, pm: 1 },
  members: [
    { personId: 'p-1' },
    { personId: 'p-2' },
  ],
};

describe('TeamCard', () => {
  it('shows the team name and total headcount when compact', () => {
    render(<TeamCard team={team} color="#aed8cb" expanded={false} />);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText(/6/)).toBeInTheDocument(); // 5 + 1
  });

  it('applies the team color as the card background', () => {
    render(<TeamCard team={team} color="#aed8cb" expanded={false} />);
    const card = screen.getByTestId('team-card');
    expect(card).toHaveStyle({ backgroundColor: '#aed8cb' });
  });

  it('does not list members when compact', () => {
    render(<TeamCard team={team} color="#aed8cb" expanded={false} />);
    expect(screen.queryByTestId('team-members')).not.toBeInTheDocument();
  });

  it('lists members when expanded', () => {
    render(<TeamCard team={team} color="#aed8cb" expanded />);
    const members = screen.getByTestId('team-members');
    expect(members).toBeInTheDocument();
    expect(members.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders without crashing when there is no icon or members', () => {
    render(
      <TeamCard team={{ id: 'x', name: 'Bare', tags: {}, headcount: {} }} color="#fff" expanded />,
    );
    expect(screen.getByText('Bare')).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
