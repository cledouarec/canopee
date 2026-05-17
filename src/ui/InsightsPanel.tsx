import { useMemo } from 'react';
import { computeMetrics } from '@/metrics/compute';
import { resolveScenario } from '@/scenarios/resolve';
import { BarChart } from '@/viz/charts/BarChart';
import { DonutChart } from '@/viz/charts/DonutChart';
import { teamColor, UNCATEGORIZED_COLOR } from '@/viz/colors';
import { useCanopee } from '@/viz/useCanopee';
import s from './InsightsPanel.module.css';

function Metric({
  label,
  id,
  value,
}: {
  label: string;
  id: string;
  value: number | string;
}): JSX.Element {
  return (
    <div>
      <div className={s.metricLabel}>{label}</div>
      <div data-testid={`metric-${id}`} className={s.metricValue}>
        {value}
      </div>
    </div>
  );
}

/** Distribution bucket for an unset tag — must match metrics/compute. */
const UNCATEGORIZED = 'uncategorized';

export function InsightsPanel(): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedScenarioId = useCanopee((s) => s.selectedScenarioId);
  const selectedEntity = useCanopee((s) => s.selectedEntity);
  const selectedTeamId = selectedEntity?.kind === 'team' ? selectedEntity.id : null;

  const data = useMemo(() => {
    if (!org) return null;
    const scoped = resolveScenario(org, selectedScenarioId);
    const names: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const colorByValue: Record<string, string> = {};
    const colorBy = org.taxonomy.colorBy;
    for (const t of scoped.teams) {
      names[t.id] = t.name;
      colors[t.id] = teamColor(t, org.taxonomy);
      colorByValue[t.id] = t.tags[colorBy] ?? UNCATEGORIZED;
    }
    return {
      report: computeMetrics(scoped, org.taxonomy),
      taxonomy: org.taxonomy,
      names,
      colors,
      colorByValue,
    };
  }, [org, selectedScenarioId]);

  if (!data) {
    return (
      <div data-testid="insights-empty" className={s.empty}>
        Load an organization to see insights.
      </div>
    );
  }

  const { report: m, taxonomy, names, colors, colorByValue } = data;
  const sizeData = Object.entries(m.teamSize.sizes).map(([id, v]) => ({
    id,
    label: names[id] ?? id,
    value: v,
    color: colors[id] ?? UNCATEGORIZED_COLOR,
  }));
  // The selected team focuses its bar and its distribution slice.
  const selectedBarId =
    selectedTeamId && selectedTeamId in m.teamSize.sizes ? selectedTeamId : undefined;
  const selectedDistValue = selectedTeamId != null ? colorByValue[selectedTeamId] : undefined;
  const colorBy = taxonomy.colorBy;
  const dist = m.distribution.byDimension[colorBy] ?? {};
  const palette = taxonomy.dimensions[colorBy]?.values ?? {};
  const donut = Object.entries(dist).map(([value, count]) => ({
    label: value,
    value: count,
    color: palette[value] ?? UNCATEGORIZED_COLOR,
  }));

  return (
    <section aria-label="Insights" className={s.section}>
      <div className={s.metrics}>
        <Metric label="Teams" id="teamCount" value={m.teamCount} />
        <Metric label="Mean size" id="meanSize" value={m.teamSize.mean.toFixed(1)} />
        <Metric label="Median size" id="medianSize" value={m.teamSize.median.toFixed(1)} />
        <Metric label="Dependency depth" id="depth" value={m.dependencyDepth} />
        <Metric
          label="Stream-aligned %"
          id="taPct"
          value={m.teamTopologies.streamAlignedPct.toFixed(0)}
        />
      </div>

      <div>
        <h3 className={s.heading}>Team size</h3>
        <BarChart title="Team size" data={sizeData} selectedId={selectedBarId} />
      </div>

      <div>
        <h3 className={s.heading}>Distribution{colorBy ? ` — ${colorBy}` : ''}</h3>
        <DonutChart
          title={`Distribution ${colorBy}`}
          segments={donut}
          selectedLabel={selectedDistValue}
        />
      </div>

      <div>
        <h3 className={s.heading}>Design alerts</h3>
        <ul data-testid="alerts" className={s.alerts}>
          {m.alerts.length === 0 ? (
            <li className={s.alertEmpty}>No alerts — the design looks balanced.</li>
          ) : (
            m.alerts.map((a) => <li key={a}>{a}</li>)
          )}
        </ul>
      </div>
    </section>
  );
}
