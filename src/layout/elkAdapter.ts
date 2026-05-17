import ELK from 'elkjs/lib/elk.bundled.js';
import type { ResolvedState, Taxonomy } from '@/model/types';
import { NODE_HEIGHT, NODE_WIDTH, type LayoutMode, type XY } from './types';

export interface LayoutOptions {
  /** Required for `bands` (groups by `taxonomy.colorBy`). */
  taxonomy?: Taxonomy;
}

const elk = new ELK();

function freeLayout(state: ResolvedState): Map<string, XY> {
  const map = new Map<string, XY>();
  for (const t of state.teams) {
    map.set(t.id, t.position ? { x: t.position.x, y: t.position.y } : { x: 0, y: 0 });
  }
  return map;
}

async function elkLayout(
  state: ResolvedState,
  direction: 'DOWN' | 'RIGHT',
): Promise<Map<string, XY>> {
  const ids = new Set(state.teams.map((t) => t.id));
  if (state.teams.length === 0) return new Map();

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
    },
    children: state.teams.map((t) => ({
      id: t.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: state.relationships
      .filter((r) => ids.has(r.source) && ids.has(r.target))
      .map((r) => ({ id: r.id, sources: [r.source], targets: [r.target] })),
  };

  const laid = await elk.layout(graph);
  const map = new Map<string, XY>();
  for (const child of laid.children ?? []) {
    map.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }
  return map;
}

const BAND_GAP_Y = NODE_HEIGHT + 80;
const BAND_GAP_X = NODE_WIDTH + 60;
const UNCATEGORIZED_BAND = ' uncategorized';

function bandsLayout(state: ResolvedState, taxonomy: Taxonomy): Map<string, XY> {
  const key = taxonomy.colorBy;
  const groups = new Map<string, string[]>();
  for (const t of state.teams) {
    const band = t.tags[key] ?? UNCATEGORIZED_BAND;
    const list = groups.get(band) ?? [];
    list.push(t.id);
    groups.set(band, list);
  }
  const map = new Map<string, XY>();
  let row = 0;
  for (const ids of groups.values()) {
    ids.forEach((id, col) => {
      map.set(id, { x: col * BAND_GAP_X, y: row * BAND_GAP_Y });
    });
    row += 1;
  }
  return map;
}

/**
 * Returns `teamId -> {x,y}` for the requested layout mode.
 * `free` keeps stored positions; `tb`/`lr` use elk layered; `bands`
 * groups by the `colorBy` dimension into swimlanes.
 */
export async function computeLayout(
  state: ResolvedState,
  mode: LayoutMode,
  options: LayoutOptions = {},
): Promise<Map<string, XY>> {
  switch (mode) {
    case 'free':
      return freeLayout(state);
    case 'tb':
      return elkLayout(state, 'DOWN');
    case 'lr':
      return elkLayout(state, 'RIGHT');
    case 'bands':
      return options.taxonomy
        ? bandsLayout(state, options.taxonomy)
        : freeLayout(state);
    default: {
      const never: never = mode;
      throw new Error(`Unknown layout mode: ${String(never)}`);
    }
  }
}
