import type { RelationshipStyle, Relationship, Taxonomy, Team } from '@/model/types';

/** Neutral grey for any value/type absent from the taxonomy (spec §5). */
export const UNCATEGORIZED_COLOR = '#c9c9c9';

/**
 * Ink for text drawn on a team card. The card background is the data-driven
 * team colour (typically a light pastel), so the label must NOT follow the
 * theme `--text` token — on dark themes that is near-white and unreadable on
 * the card. Kept in sync with the literal in TeamCard.module.css.
 */
export const NODE_TEXT_COLOR = '#1f2a24';

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

/**
 * A taxonomy color is rendered into SVG `fill="..."` attributes (including the
 * export path via `dangerouslySetInnerHTML`). `.orga.json` is user-importable,
 * so a non-hex value must never reach an attribute — fall back to grey.
 */
function safeColor(c: string): string {
  return HEX_COLOR.test(c) ? c : UNCATEGORIZED_COLOR;
}

/** Fill color for a team driven by `taxonomy.colorBy`; grey if unresolved. */
export function teamColor(team: Team, taxonomy: Taxonomy): string {
  const dim = taxonomy.dimensions[taxonomy.colorBy];
  if (!dim) return UNCATEGORIZED_COLOR;
  const value = team.tags[taxonomy.colorBy];
  if (value === undefined) return UNCATEGORIZED_COLOR;
  return safeColor(dim.values[value] ?? UNCATEGORIZED_COLOR);
}

/** Line style for a relationship; `solid` if the type is not in the taxonomy. */
export function relationshipStyle(
  rel: Relationship,
  taxonomy: Taxonomy,
): RelationshipStyle {
  return taxonomy.relationshipTypes[rel.type]?.style ?? 'solid';
}

/** SVG `stroke-dasharray` for an edge line style; `undefined` for solid. */
export function edgeDashArray(style: RelationshipStyle): string | undefined {
  return style === 'dashed' ? '6 4' : style === 'dotted' ? '2 4' : undefined;
}
