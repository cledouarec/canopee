export interface BarDatum {
  /** Stable key used to match the selected team (falls back to label). */
  id?: string;
  label: string;
  value: number;
  /** Per-bar fill (team color); defaults to the accent. */
  color?: string;
}

export interface BarChartProps {
  title: string;
  data: BarDatum[];
  width?: number;
  height?: number;
  /** When set, the matching bar is focused and the others are dimmed. */
  selectedId?: string;
}

/** Dependency-free SVG bar chart (spec §10: hand-crafted mini-charts). */
export function BarChart({
  title,
  data,
  width = 220,
  height = 120,
  selectedId,
}: BarChartProps): JSX.Element {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  const slot = data.length > 0 ? width / data.length : width;
  const barW = Math.max(2, slot * 0.6);
  const pad = 16;
  const usableH = height - pad;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      {data.map((d, i) => {
        const h = max > 0 ? (d.value / max) * usableH : 0;
        const isSelected = selectedId != null && (d.id ?? d.label) === selectedId;
        // Nothing selected → all bars normal; otherwise dim the rest.
        const dimmed = selectedId != null && !isSelected;
        return (
          <rect
            key={d.label + i}
            x={i * slot + (slot - barW) / 2}
            y={usableH - h}
            width={barW}
            height={h}
            rx={2}
            fill={d.color ?? 'var(--accent)'}
            opacity={dimmed ? 0.3 : 1}
            stroke={isSelected ? 'var(--text)' : 'none'}
            strokeWidth={isSelected ? 1.5 : 0}
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
