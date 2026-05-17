import type { Id, ResolvedState, Taxonomy, XY } from '@/model/types';
import { teamColor, NODE_TEXT_COLOR } from '@/viz/colors';
import type { ExportBackground, ExportThemeTokens } from './types';

const NODE_W = 180;
const NODE_H = 64;
const MARGIN = 40;

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pure: a self-contained, theme-aware SVG of the graph at given positions. */
export function buildGraphSvg(
  state: ResolvedState,
  taxonomy: Taxonomy,
  positions: Map<Id, XY>,
  tokens: ExportThemeTokens,
  background: ExportBackground,
): string {
  const pos = (id: Id): XY => positions.get(id) ?? { x: 0, y: 0 };
  const xs = state.teams.map((t) => pos(t.id).x);
  const ys = state.teams.map((t) => pos(t.id).y);
  const minX = xs.length ? Math.min(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;
  const maxY = ys.length ? Math.max(...ys) : 0;
  const width = maxX - minX + NODE_W + MARGIN * 2;
  const height = maxY - minY + NODE_H + MARGIN * 2;
  const tx = (x: number): number => x - minX + MARGIN;
  const ty = (y: number): number => y - minY + MARGIN;

  const byId = new Map(state.teams.map((t) => [t.id, t]));
  const lines = state.relationships
    .filter((r) => byId.has(r.source) && byId.has(r.target))
    .map((r) => {
      const a = pos(r.source);
      const b = pos(r.target);
      return `<line x1="${tx(a.x) + NODE_W / 2}" y1="${ty(a.y) + NODE_H / 2}" x2="${
        tx(b.x) + NODE_W / 2
      }" y2="${ty(b.y) + NODE_H / 2}" stroke="${tokens.border}" stroke-width="1.5" />`;
    })
    .join('');

  const nodes = state.teams
    .map((t) => {
      const p = pos(t.id);
      const fill = teamColor(t, taxonomy);
      return (
        `<g transform="translate(${tx(p.x)},${ty(p.y)})">` +
        `<rect width="${NODE_W}" height="${NODE_H}" rx="10" fill="${fill}" stroke="${tokens.border}" />` +
        `<text x="12" y="26" font-family="sans-serif" font-size="14" font-weight="600" fill="${NODE_TEXT_COLOR}">${escapeXml(
          t.name,
        )}</text>` +
        `<text x="12" y="46" font-family="sans-serif" font-size="11" fill="${NODE_TEXT_COLOR}">${Object.values(
          t.headcount,
        ).reduce((s, n) => s + n, 0)} people</text>` +
        `</g>`
      );
    })
    .join('');

  const bg =
    background === 'theme'
      ? `<rect width="${width}" height="${height}" fill="${tokens.bg}" />`
      : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}">${bg}${lines}${nodes}</svg>`
  );
}
