import type { ResolvedState, Taxonomy } from '@/model/types';
import { teamColor } from '@/viz/colors';
import { escapeXml } from './graphSvg';
import type { ExportBackground, ExportThemeTokens } from './types';

export type DirectoryLayout = 'grid' | 'list';

const CARD_W = 240;
const CARD_H = 130;
const GAP = 16;
const MARGIN = 24;

/** Pure: a directory of team cards as a self-contained SVG. */
export function buildDirectorySvg(
  state: ResolvedState,
  taxonomy: Taxonomy,
  tokens: ExportThemeTokens,
  layout: DirectoryLayout,
  background: ExportBackground,
): string {
  const cols = layout === 'list' ? 1 : 3;
  const cardW = layout === 'list' ? CARD_W * 2 + GAP : CARD_W;
  const rows = Math.max(1, Math.ceil(state.teams.length / cols));
  const width = MARGIN * 2 + cols * cardW + (cols - 1) * GAP;
  const height = MARGIN * 2 + rows * CARD_H + (rows - 1) * GAP;

  const cards = state.teams
    .map((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = MARGIN + col * (cardW + GAP);
      const y = MARGIN + row * (CARD_H + GAP);
      const total = Object.values(t.headcount).reduce((s, n) => s + n, 0);
      const accent = teamColor(t, taxonomy);
      return (
        `<g transform="translate(${x},${y})">` +
        `<rect width="${cardW}" height="${CARD_H}" rx="12" fill="${tokens.surface}" stroke="${tokens.border}" />` +
        `<rect width="6" height="${CARD_H}" rx="3" fill="${accent}" />` +
        `<text x="18" y="26" font-family="sans-serif" font-size="15" font-weight="700" fill="${tokens.text}">${escapeXml(
          t.name,
        )}</text>` +
        `<text x="18" y="48" font-family="sans-serif" font-size="11" fill="${tokens.text}">${escapeXml(
          t.mission ?? '',
        )}</text>` +
        `<text x="18" y="66" font-family="sans-serif" font-size="11" fill="${tokens.text}">${escapeXml(
          t.scope ?? '',
        )}</text>` +
        `<text x="18" y="${CARD_H - 14}" font-family="sans-serif" font-size="11" fill="${tokens.text}">${total} people</text>` +
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
    `viewBox="0 0 ${width} ${height}">${bg}${cards}</svg>`
  );
}
