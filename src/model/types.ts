export type Id = string;

export const SCHEMA_VERSION = 1;
export const CURRENT_SCENARIO_ID = 'current';
/** Zoom for a brand-new organization (1 = 100%). */
export const DEFAULT_ZOOM = 1;

export type RelationshipStyle = 'solid' | 'dashed' | 'dotted';

export interface DimensionDef {
  label: string;
  /** value -> hex color (#rgb or #rrggbb) */
  values: Record<string, string>;
}

export interface RelationshipTypeDef {
  label: string;
  style: RelationshipStyle;
}

export interface Taxonomy {
  /** key of the dimension that drives node color */
  colorBy: string;
  dimensions: Record<string, DimensionDef>;
  relationshipTypes: Record<string, RelationshipTypeDef>;
}

export interface Member {
  personId: Id;
  /** allocation percentage 0–100 */
  allocation?: number;
}

export interface Team {
  id: Id;
  name: string;
  description?: string;
  mission?: string;
  scope?: string;
  /** Lucide icon name (kebab-case) */
  icon?: string;
  /** dimension -> value (single value per dimension in V1) */
  tags: Record<string, string>;
  /** role -> headcount */
  headcount: Record<string, number>;
  members?: Member[];
  parentId?: Id | null;
  position?: { x: number; y: number };
}

export interface Person {
  id: Id;
  name: string;
  role: string;
  skills?: string[];
}

export interface Relationship {
  id: Id;
  source: Id;
  target: Id;
  /** free value, ideally a key of a relationshipType in the taxonomy */
  type: string;
  directed: boolean;
  note?: string;
}

/**
 * A scenario stores only deltas vs `current`:
 * - `teams` / `relationships`: entities added OR modified (upsert by id)
 * - `removedTeamIds` / `removedRelationshipIds`: deletions
 * The `current` scenario has empty deltas; the root state of the org IS `current`.
 */
export interface ScenarioDelta {
  id: Id;
  name: string;
  teams: Team[];
  relationships: Relationship[];
  removedTeamIds?: Id[];
  removedRelationshipIds?: Id[];
}

/** Persisted view preferences that travel with the file (spec §5.1). */
export interface OrgView {
  /** Canvas zoom level, 1 = 100%. */
  zoom: number;
}

export interface Organization {
  schemaVersion: number;
  name: string;
  taxonomy: Taxonomy;
  teams: Team[];
  people: Person[];
  relationships: Relationship[];
  scenarios: ScenarioDelta[];
  /** Saved canvas view (zoom). Restored on load; defaults to 100% for new orgs. */
  view: OrgView;
}

/** Resolved state of a scenario (input to diff). */
export interface ResolvedState {
  teams: Team[];
  relationships: Relationship[];
}

/** A 2-D point (layout / free position). */
export interface XY {
  x: number;
  y: number;
}
