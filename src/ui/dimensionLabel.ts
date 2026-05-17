/**
 * Display name for a taxonomy dimension. Strips a trailing parenthetical
 * qualifier (e.g. "Type (Team Topologies)" → "Type") so the picker stays
 * compact and matches the framework wording even for orgs persisted/imported
 * with the older verbose label.
 */
export function shortDimensionLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim() || label;
}
