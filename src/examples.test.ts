import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseOrg } from './serialization/serialize';

const examplesDir = join(import.meta.dirname, '..', 'examples');
const files = readdirSync(examplesDir).filter((f) => f.endsWith('.orga.json'));

describe('bundled examples', () => {
  it('ships at least one example', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s parses against the schema', (file) => {
    const text = readFileSync(join(examplesDir, file), 'utf-8');
    expect(() => parseOrg(text)).not.toThrow();
  });
});
