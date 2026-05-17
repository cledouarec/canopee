import { describe, expect, it } from 'vitest';
import { FRAMEWORKS, getFramework } from './index';

describe('framework registry', () => {
  it('lists the 5 V1 frameworks', () => {
    expect(FRAMEWORKS.map((f) => f.id).sort()).toEqual(
      ['custom', 'horizontal-metier', 'spotify', 'team-topologies', 'vertical-feature'].sort(),
    );
  });

  it('looks up a framework by id', () => {
    expect(getFramework('team-topologies')?.label).toBe('Team Topologies');
  });

  it('returns undefined for an unknown id', () => {
    expect(getFramework('nope')).toBeUndefined();
  });
});
