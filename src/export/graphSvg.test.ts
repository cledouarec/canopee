import { describe, it, expect } from 'vitest';
import { buildGraphSvg } from './graphSvg';
import type { ResolvedState, Taxonomy, XY } from '@/model/types';
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
  border: '#cccccc',
  accent: '#15c08a',
};

const state: ResolvedState = {
  teams: [
    { id: 't-1', name: 'Checkout', tags: { topology: 'platform' }, headcount: { dev: 3 } },
    { id: 't-2', name: 'Payments', tags: {}, headcount: {} },
  ],
  relationships: [{ id: 'r-1', source: 't-1', target: 't-2', type: 'x', directed: true }],
};

const positions = new Map<string, XY>([
  ['t-1', { x: 0, y: 0 }],
  ['t-2', { x: 300, y: 120 }],
]);

describe('buildGraphSvg', () => {
  it('produces a self-contained SVG document', () => {
    const svg = buildGraphSvg(state, taxonomy, positions, tokens, 'theme');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('draws one node rect per team with its taxonomy color and name', () => {
    const svg = buildGraphSvg(state, taxonomy, positions, tokens, 'theme');
    expect(svg).toContain('Checkout');
    expect(svg).toContain('Payments');
    expect(svg).toContain('#aed8cb');
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('draws an edge line per relationship', () => {
    const svg = buildGraphSvg(state, taxonomy, positions, tokens, 'theme');
    expect((svg.match(/<line/g) ?? []).length).toBe(1);
  });

  it('omits the background rect when transparent', () => {
    const themed = buildGraphSvg(state, taxonomy, positions, tokens, 'theme');
    const transparent = buildGraphSvg(state, taxonomy, positions, tokens, 'transparent');
    expect(themed).toContain(`fill="${tokens.bg}"`);
    expect(transparent).not.toContain(`fill="${tokens.bg}"`);
  });

  it('escapes XML-special characters in team names', () => {
    const s: ResolvedState = {
      teams: [{ id: 'x', name: 'A & B <C>', tags: {}, headcount: {} }],
      relationships: [],
    };
    const svg = buildGraphSvg(s, taxonomy, new Map([['x', { x: 0, y: 0 }]]), tokens, 'theme');
    expect(svg).toContain('A &amp; B &lt;C&gt;');
    expect(svg).not.toContain('A & B <C>');
  });

  it('handles an empty organization', () => {
    const svg = buildGraphSvg({ teams: [], relationships: [] }, taxonomy, new Map(), tokens, 'theme');
    expect(svg.startsWith('<svg')).toBe(true);
  });
});
