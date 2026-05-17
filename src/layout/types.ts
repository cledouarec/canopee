/** Layout strategies offered by the dock (spec §7). */
export type LayoutMode = 'free' | 'tb' | 'lr' | 'bands';

export type { XY } from '@/model/types';

/** Pixel size used for every team node when auto-laying out. */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 96;
