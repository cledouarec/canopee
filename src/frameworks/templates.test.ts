import { describe, expect, it } from 'vitest';
import { customFramework } from './custom';
import { horizontalMetier } from './horizontal';
import { spotify } from './spotify';
import { verticalFeature } from './vertical';

describe('framework templates', () => {
  it('horizontal-metier colors by craft dimension', () => {
    const tax = horizontalMetier.buildTaxonomy();
    expect(tax.colorBy).toBe('craft');
    expect(Object.keys(tax.dimensions.craft.values).length).toBeGreaterThan(0);
  });

  it('vertical-feature colors by stream dimension', () => {
    const tax = verticalFeature.buildTaxonomy();
    expect(tax.colorBy).toBe('stream');
    expect(tax.dimensions.stream).toBeDefined();
  });

  it('spotify exposes a "type" dimension with squad', () => {
    const tax = spotify.buildTaxonomy();
    expect(Object.keys(tax.dimensions.type.values)).toContain('squad');
  });

  it('custom framework is empty but valid', () => {
    const tax = customFramework.buildTaxonomy();
    expect(tax.dimensions).toEqual({});
    expect(tax.relationshipTypes).toEqual({});
    expect(tax.colorBy).toBe('');
  });
});
