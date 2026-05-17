import { describe, it, expect } from 'vitest';
import { migrate, FutureSchemaError } from './migrate';
import { SCHEMA_VERSION } from '@/model/types';

describe('migrate', () => {
  it('returns the object unchanged when already at current version', () => {
    const obj = { schemaVersion: SCHEMA_VERSION, name: 'X' };
    expect(migrate(obj)).toBe(obj);
  });

  it('throws FutureSchemaError when the file is newer than the app', () => {
    expect(() => migrate({ schemaVersion: SCHEMA_VERSION + 1 })).toThrow(FutureSchemaError);
  });

  it('throws a clear error when schemaVersion is missing', () => {
    expect(() => migrate({ name: 'X' })).toThrow(/schemaVersion/);
  });
});
