import type { Framework } from './types';

export const horizontalMetier: Framework = {
  id: 'horizontal-metier',
  label: 'Horizontal (by craft)',
  buildTaxonomy: () => ({
    colorBy: 'craft',
    dimensions: {
      craft: {
        label: 'Craft',
        values: {
          backend: '#aed8cb',
          frontend: '#cfe7ab',
          data: '#d6ead0',
          ops: '#e6e8b4',
          design: '#c8e0d2',
          product: '#dfe7a8',
        },
      },
    },
    relationshipTypes: {
      collaboration: { label: 'Collaboration', style: 'solid' },
      'depends-on': { label: 'Depends on', style: 'dashed' },
    },
  }),
};
