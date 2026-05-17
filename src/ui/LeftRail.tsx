import s from './LeftRail.module.css';
import prim from './styles/primitives.module.css';

export type RailView = 'graph' | 'scenarios' | 'comparison';

const ITEMS: { view: RailView; label: string; glyph: string; disabled?: boolean }[] = [
  { view: 'graph', label: 'Graph', glyph: '◉' },
  { view: 'scenarios', label: 'Scenarios', glyph: '⎘' },
  { view: 'comparison', label: 'Comparison', glyph: '⇄' },
];

export interface LeftRailProps {
  active: RailView;
  onSelect: (view: RailView) => void;
}

export function LeftRail({ active, onSelect }: LeftRailProps): JSX.Element {
  return (
    <nav aria-label="Views" className={s.rail}>
      {ITEMS.map((it) => (
        <button
          key={it.view}
          aria-label={it.label}
          aria-pressed={active === it.view}
          disabled={it.disabled}
          title={it.disabled ? `${it.label} (coming soon)` : it.label}
          onClick={() => onSelect(it.view)}
          className={active === it.view ? prim.pill : prim.pillGhost}
        >
          {it.glyph}
        </button>
      ))}
    </nav>
  );
}
