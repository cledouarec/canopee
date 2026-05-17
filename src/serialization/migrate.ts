import { SCHEMA_VERSION } from '@/model/types';

export class FutureSchemaError extends Error {
  constructor(found: number) {
    super(
      `This file was created by a newer version of Canopée ` +
        `(schemaVersion ${found}, this app supports ${SCHEMA_VERSION}). Please update the application.`,
    );
    this.name = 'FutureSchemaError';
  }
}

/**
 * Validates `schemaVersion` and blocks files from a newer app version.
 *
 * No migration steps exist yet: V1 is not frozen, so the schema is still
 * free to change in place. When V1 ships, add successive migration steps
 * here (each bumping `schemaVersion` by one).
 */
export function migrate(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || !('schemaVersion' in raw)) {
    throw new Error('Invalid file: missing "schemaVersion" field.');
  }
  const version = (raw as { schemaVersion: unknown }).schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('Invalid file: "schemaVersion" must be a positive integer.');
  }
  if (version > SCHEMA_VERSION) {
    throw new FutureSchemaError(version);
  }
  return raw;
}
