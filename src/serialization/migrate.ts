import { DEFAULT_ZOOM, SCHEMA_VERSION } from '@/model/types';

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
 * Validates `schemaVersion`, blocks files from a newer app version, then
 * applies successive in-order migration steps (each bumping `schemaVersion`
 * by one) until the document reaches the current schema.
 *
 * Files already at the current version are returned untouched (same
 * reference). Add the next step as `if (version < N)` when bumping.
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
  if (version === SCHEMA_VERSION) {
    return raw;
  }

  const doc = raw as Record<string, unknown>;
  // V1 -> V2: `view` became a persisted, required field (spec §5.1).
  // Backfill it for legacy files written before it existed.
  return {
    ...doc,
    schemaVersion: 2,
    view: doc.view ?? { zoom: DEFAULT_ZOOM },
  };
}
