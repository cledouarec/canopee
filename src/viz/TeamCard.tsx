import type { Team } from '@/model/types';
import { getLucideIcon } from './icon';
import s from './TeamCard.module.css';

export interface TeamCardProps {
  team: Team;
  color: string;
  expanded: boolean;
}

function totalHeadcount(team: Team): number {
  return Object.values(team.headcount).reduce((a, b) => a + b, 0);
}

/**
 * Presentational team card. Compact = icon + name + headcount; expanded also
 * lists members. No store / React Flow coupling so it is unit-testable.
 */
export function TeamCard({ team, color, expanded }: TeamCardProps): JSX.Element {
  const Icon = getLucideIcon(team.icon);
  const members = team.members ?? [];

  return (
    <div data-testid="team-card" className={s.card} style={{ backgroundColor: color }}>
      <div className={s.head}>
        <Icon size={18} />
        <strong>{team.name}</strong>
      </div>
      <div className={s.count}>{totalHeadcount(team)} people</div>
      {expanded && members.length > 0 && (
        <ul data-testid="team-members" className={s.members}>
          {members.map((m) => (
            <li key={m.personId} className={s.member}>
              {m.personId}
              {m.allocation !== undefined ? ` (${m.allocation}%)` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
