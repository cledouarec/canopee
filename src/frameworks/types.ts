import type { Taxonomy } from '@/model/types';

export interface Framework {
  /** stable key (never serialized into the org file) */
  id: string;
  /** displayed label */
  label: string;
  /** generates a fresh taxonomy (the file keeps its own standalone copy) */
  buildTaxonomy: () => Taxonomy;
}
