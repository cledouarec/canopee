import { describe, expect, it } from 'vitest';
import { EXPORT_BACKGROUNDS, EXPORT_CONTENTS, EXPORT_FORMATS } from './types';

describe('export option lists', () => {
  it('offers graph and directory content', () => {
    expect(EXPORT_CONTENTS).toEqual(['graph', 'directory']);
  });
  it('offers svg and png formats', () => {
    expect(EXPORT_FORMATS).toEqual(['svg', 'png']);
  });
  it('offers themed and transparent backgrounds', () => {
    expect(EXPORT_BACKGROUNDS).toEqual(['theme', 'transparent']);
  });
});
