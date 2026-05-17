import { describe, it, expect } from 'vitest';
import { newId } from './ids';

describe('newId', () => {
  it('prefixes the id and stays unique', () => {
    const a = newId('t');
    const b = newId('t');
    expect(a.startsWith('t-')).toBe(true);
    expect(a).not.toBe(b);
  });

  it('defaults to an "id" prefix when none given', () => {
    expect(newId().startsWith('id-')).toBe(true);
  });
});
