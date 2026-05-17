import { describe, it, expect } from 'vitest';
import { EXPORT_CONTENTS, EXPORT_FORMATS, EXPORT_BACKGROUNDS } from './types';

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
