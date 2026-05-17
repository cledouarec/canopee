/**
 * Human-readable unique identifier: `<prefix>-<random base36>`.
 * No external dependency; sufficient for local single-user ids.
 */
export function newId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}-${time}${rand}`;
}
