import type { Framework } from './types';

export const teamTopologies: Framework = {
  id: 'team-topologies',
  label: 'Team Topologies',
  buildTaxonomy: () => ({
    colorBy: 'topology',
    dimensions: {
      topology: {
        label: 'Type',
        values: {
          'stream-aligned': '#cfe7ab',
          platform: '#aed8cb',
          enabling: '#d6ead0',
          'complicated-subsystem': '#e6e8b4',
        },
      },
    },
    relationshipTypes: {
      collaboration: { label: 'Collaboration', style: 'solid' },
      'x-as-a-service': { label: 'X-as-a-Service', style: 'dashed' },
      facilitating: { label: 'Facilitating', style: 'dotted' },
    },
  }),
};
