export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  title: string;
  segments: DonutSegment[];
  size?: number;
  /** When set, the segment with this label is focused, the others dimmed. */
  selectedLabel?: string;
}

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

/** Dependency-free SVG donut chart (spec §10). */
export function DonutChart({
  title,
  segments,
  size = 140,
  selectedLabel,
}: DonutChartProps): JSX.Element {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  let angle = -Math.PI / 2;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={2} />
      {total > 0 &&
        segments
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const sweep = (s.value / total) * Math.PI * 2;
            const [x0, y0] = polar(cx, cy, r, angle);
            const [x1, y1] = polar(cx, cy, r, angle + sweep);
            const large = sweep > Math.PI ? 1 : 0;
            angle += sweep;
            const isSelected = selectedLabel != null && s.label === selectedLabel;
            const dimmed = selectedLabel != null && !isSelected;
            return (
              <path
                key={s.label + i}
                d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
                fill={s.color}
                opacity={dimmed ? 0.3 : 1}
                stroke={isSelected ? 'var(--text)' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </path>
            );
          })}
    </svg>
  );
}
