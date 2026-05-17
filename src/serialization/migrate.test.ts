import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@/model/types';
import { FutureSchemaError, migrate } from './migrate';

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
