import { useMemo } from 'react';
import type { ScenarioDelta } from '@/model/types';
import { useCanopee } from '@/viz/useCanopee';
import { compareScenarios } from '@/viz/diffModel';
import { ComparisonGraph } from '@/viz/ComparisonGraph';
import { ComparisonSummary } from './ComparisonSummary';
import { useComparison } from './useComparison';
import s from './ComparisonView.module.css';

function ScenarioSelect({
  label,
  value,
  scenarios,
  onChange,
}: {
  label: string;
  value: string;
  scenarios: ScenarioDelta[];
  onChange: (id: string) => void;
}): JSX.Element {
  return (
    <label className={s.label}>
      {label}{' '}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ComparisonView(): JSX.Element {
  const org = useCanopee((s) => s.org);
  const leftId = useComparison((s) => s.leftId);
  const rightId = useComparison((s) => s.rightId);
  const setLeft = useComparison((s) => s.setLeft);
  const setRight = useComparison((s) => s.setRight);

  // A scenario referenced here may have been deleted (the comparison store is
  // independent of the canopee store and is not reconciled); clamp unknown ids
  // back to `current` so `resolveScenario` never throws (spec §11).
  const comparison = useMemo(() => {
    if (!org) return null;
    const valid = new Set(org.scenarios.map((s) => s.id));
    const safeLeft = valid.has(leftId) ? leftId : 'current';
    const safeRight = valid.has(rightId) ? rightId : 'current';
    return { ...compareScenarios(org, safeLeft, safeRight), safeLeft, safeRight };
  }, [org, leftId, rightId]);

  if (!org || !comparison) {
    return (
      <div data-testid="comparison-empty" className={s.empty}>
        Load an organization to compare scenarios.
      </div>
    );
  }

  return (
    <div className={s.grid}>
      <div className={s.selects}>
        <ScenarioSelect
          label="Left scenario"
          value={comparison.safeLeft}
          scenarios={org.scenarios}
          onChange={setLeft}
        />
        <ScenarioSelect
          label="Right scenario"
          value={comparison.safeRight}
          scenarios={org.scenarios}
          onChange={setRight}
        />
      </div>
      <div className={s.panes}>
        <div className={s.pane}>
          <ComparisonGraph state={comparison.left} diff={comparison.diff} />
        </div>
        <div className={s.pane}>
          <ComparisonGraph state={comparison.right} diff={comparison.diff} />
        </div>
      </div>
      <ComparisonSummary diff={comparison.diff} />
    </div>
  );
}
