import { describe, expect, it } from 'vitest';
import type { Relationship, Taxonomy, Team } from '@/model/types';
import { relationshipStyle, teamColor, UNCATEGORIZED_COLOR } from './colors';

const taxonomy: Taxonomy = {
  colorBy: 'topology',
  dimensions: {
    topology: {
      label: 'Type',
      values: { 'stream-aligned': '#cfe7ab', platform: '#aed8cb' },
    },
  },
  relationshipTypes: {
    'x-as-a-service': { label: 'XaaS', style: 'dashed' },
  },
};

function team(tags: Record<string, string>): Team {
  return { id: 't', name: 'T', tags, headcount: {} };
}

describe('teamColor', () => {
  it('returns the taxonomy color for the colorBy dimension value', () => {
    expect(teamColor(team({ topology: 'platform' }), taxonomy)).toBe('#aed8cb');
  });

  it('falls back to grey when the tag value is unknown (spec §5 tolerance)', () => {
    expect(teamColor(team({ topology: 'ghost' }), taxonomy)).toBe(UNCATEGORIZED_COLOR);
  });

  it('falls back to grey when the team has no value for the colorBy dimension', () => {
    expect(teamColor(team({}), taxonomy)).toBe(UNCATEGORIZED_COLOR);
  });

  it('falls back to grey when colorBy points at a missing dimension', () => {
    expect(teamColor(team({ topology: 'platform' }), { ...taxonomy, colorBy: 'nope' })).toBe(
      UNCATEGORIZED_COLOR,
    );
  });

  it('rejects a non-hex (injection-crafted) taxonomy color value', () => {
    const malicious: Taxonomy = {
      colorBy: 'topology',
      dimensions: {
        topology: { label: 'T', values: { evil: 'red" onload="alert(1)' } },
      },
      relationshipTypes: {},
    };
    expect(teamColor(team({ topology: 'evil' }), malicious)).toBe(UNCATEGORIZED_COLOR);
  });
});

describe('relationshipStyle', () => {
  const rel = (type: string): Relationship => ({
    id: 'r',
    source: 'a',
    target: 'b',
    type,
    directed: true,
  });
  it('returns the taxonomy line style for a known type', () => {
    expect(relationshipStyle(rel('x-as-a-service'), taxonomy)).toBe('dashed');
  });
  it('defaults to solid for an unknown relationship type', () => {
    expect(relationshipStyle(rel('mystery'), taxonomy)).toBe('solid');
  });
});
