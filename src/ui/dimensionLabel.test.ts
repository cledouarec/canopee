import { describe, expect, it } from 'vitest';
import { shortDimensionLabel } from './dimensionLabel';

describe('shortDimensionLabel', () => {
  it('strips a trailing parenthetical qualifier', () => {
    expect(shortDimensionLabel('Type (Team Topologies)')).toBe('Type');
  });

  it('leaves a plain label untouched', () => {
    expect(shortDimensionLabel('Type')).toBe('Type');
  });

  it('keeps non-trailing parentheses', () => {
    expect(shortDimensionLabel('Squad (alpha) team')).toBe('Squad (alpha) team');
  });

  it('falls back to the original when stripping would empty it', () => {
    expect(shortDimensionLabel('(Team Topologies)')).toBe('(Team Topologies)');
  });
});
