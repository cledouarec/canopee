import type { Framework } from './types';

export const verticalFeature: Framework = {
  id: 'vertical-feature',
  label: 'Vertical (feature / impact)',
  buildTaxonomy: () => ({
    colorBy: 'stream',
    dimensions: {
      stream: {
        label: 'Value stream',
        values: {
          growth: '#cfe7ab',
          retention: '#aed8cb',
          monetization: '#e6e8b4',
          platform: '#d6ead0',
        },
      },
    },
    relationshipTypes: {
      collaboration: { label: 'Collaboration', style: 'solid' },
      'depends-on': { label: 'Depends on', style: 'dashed' },
    },
  }),
};
