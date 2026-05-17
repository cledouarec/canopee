import type { Framework } from './types';

export const customFramework: Framework = {
  id: 'custom',
  label: 'Blank (custom)',
  buildTaxonomy: () => ({
    colorBy: '',
    dimensions: {},
    relationshipTypes: {},
  }),
};
