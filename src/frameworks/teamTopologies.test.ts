import { describe, expect, it } from 'vitest';
import { teamTopologies } from './teamTopologies';

describe('teamTopologies framework', () => {
  it('has the 4 official team types in the topology dimension', () => {
    const tax = teamTopologies.buildTaxonomy();
    const values = Object.keys(tax.dimensions.topology.values);
    expect(values.sort()).toEqual(
      ['complicated-subsystem', 'enabling', 'platform', 'stream-aligned'].sort(),
    );
  });

  it('has the 3 interaction modes as relationship types', () => {
    const tax = teamTopologies.buildTaxonomy();
    expect(Object.keys(tax.relationshipTypes).sort()).toEqual(
      ['collaboration', 'facilitating', 'x-as-a-service'].sort(),
    );
  });

  it('colors by topology by default', () => {
    expect(teamTopologies.buildTaxonomy().colorBy).toBe('topology');
  });
});
