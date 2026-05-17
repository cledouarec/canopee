import { describe, expect, it } from 'vitest';
import type { ResolvedState, Taxonomy } from '@/model/types';
import { buildDirectorySvg } from './directorySvg';
import type { ExportThemeTokens } from './types';

const taxonomy: Taxonomy = {
  colorBy: 'topology',
  dimensions: { topology: { label: 'Type', values: { platform: '#aed8cb' } } },
  relationshipTypes: {},
};
const tokens: ExportThemeTokens = {
  bg: '#eef3ec',
  surface: '#ffffff',
  text: '#1f2a24',
  border: '#ccc',
  accent: '#15c08a',
};
const state: ResolvedState = {
  teams: [
    {
      id: 't-1',
      name: 'Checkout',
      mission: 'Win conversion',
      scope: 'Funnel',
      tags: { topology: 'platform' },
      headcount: { dev: 4, pm: 1 },
    },
    { id: 't-2', name: 'Payments', tags: {}, headcount: {} },
  ],
  relationships: [],
};

describe('buildDirectorySvg', () => {
  it('renders a card per team with name, mission and scope (grid)', () => {
    const svg = buildDirectorySvg(state, taxonomy, tokens, 'grid', 'theme');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('Checkout');
    expect(svg).toContain('Win conversion');
    expect(svg).toContain('Funnel');
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('shows the headcount total', () => {
    const svg = buildDirectorySvg(state, taxonomy, tokens, 'grid', 'theme');
    expect(svg).toContain('5 people');
  });

  it('list layout stacks cards full width (taller than grid for same teams)', () => {
    const grid = buildDirectorySvg(state, taxonomy, tokens, 'grid', 'theme');
    const list = buildDirectorySvg(state, taxonomy, tokens, 'list', 'theme');
    const h = (s: string): number => Number(/height="(\d+)"/.exec(s)![1]);
    expect(h(list)).toBeGreaterThanOrEqual(h(grid));
  });

  it('omits the themed background when transparent', () => {
    const t = buildDirectorySvg(state, taxonomy, tokens, 'grid', 'transparent');
    expect(t).not.toContain(`fill="${tokens.bg}"`);
  });

  it('escapes XML in mission text', () => {
    const s: ResolvedState = {
      teams: [{ id: 'x', name: 'N', mission: '<b>&</b>', tags: {}, headcount: {} }],
      relationships: [],
    };
    const svg = buildDirectorySvg(s, taxonomy, tokens, 'grid', 'theme');
    expect(svg).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
  });
});
