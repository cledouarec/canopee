import type { StateDiff } from '@/scenarios/diff';
import { comparisonSummaryText } from '@/viz/diffModel';
import s from './ComparisonSummary.module.css';

const COUNTERS: { key: keyof StateDiff['summary']; label: string }[] = [
  { key: 'teamsAdded', label: 'Teams added' },
  { key: 'teamsRemoved', label: 'Teams removed' },
  { key: 'teamsModified', label: 'Teams modified' },
  { key: 'relationshipsAdded', label: 'Relationships added' },
  { key: 'relationshipsRemoved', label: 'Relationships removed' },
];

function download(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ComparisonSummary({ diff }: { diff: StateDiff }): JSX.Element {
  const ids = [...diff.teams.added, ...diff.teams.removed, ...diff.teams.modified];
  return (
    <section aria-label="Comparison summary" className={s.section}>
      <div className={s.counters}>
        {COUNTERS.map((c) => (
          <div key={c.key}>
            <div className={s.counterLabel}>{c.label}</div>
            <div data-testid={`count-${c.key}`} className={s.counterValue}>
              {diff.summary[c.key]}
            </div>
          </div>
        ))}
      </div>
      <ul className={s.idList}>
        {ids.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
      <button
        aria-label="Export summary"
        onClick={() => download('comparison.txt', comparisonSummaryText(diff))}
        className={s.exportBtn}
      >
        Export summary
      </button>
    </section>
  );
}
