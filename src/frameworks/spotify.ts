import type { Framework } from './types';

export const spotify: Framework = {
  id: 'spotify',
  label: 'Spotify model',
  buildTaxonomy: () => ({
    colorBy: 'type',
    dimensions: {
      type: {
        label: 'Type',
        values: {
          squad: '#cfe7ab',
          tribe: '#aed8cb',
          chapter: '#d6ead0',
          guild: '#e6e8b4',
        },
      },
    },
    relationshipTypes: {
      collaboration: { label: 'Collaboration', style: 'solid' },
      'depends-on': { label: 'Depends on', style: 'dashed' },
    },
  }),
};
