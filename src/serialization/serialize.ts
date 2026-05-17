import type { Organization } from '@/model/types';
import { organizationSchema } from './schema';
import { migrate } from './migrate';

export interface OrgIssue {
  path: string;
  message: string;
}

export class OrgParseError extends Error {
  issues: OrgIssue[];
  constructor(message: string, issues: OrgIssue[]) {
    super(message);
    this.name = 'OrgParseError';
    this.issues = issues;
  }
}

/** Model -> pretty-printed JSON (source of truth artifact). */
export function serializeOrg(org: Organization): string {
  return JSON.stringify(org, null, 2);
}

/**
 * JSON -> validated model.
 * Steps: parse JSON -> migrate (schemaVersion) -> Zod validation.
 * All errors throw `OrgParseError` (never a raw exception).
 */
export function parseOrg(text: string): Organization {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new OrgParseError('JSON file unreadable (invalid syntax).', [
      { path: '(root)', message: 'Malformed JSON' },
    ]);
  }

  let migrated: unknown;
  try {
    migrated = migrate(raw);
  } catch (e) {
    throw new OrgParseError((e as Error).message, [
      { path: 'schemaVersion', message: (e as Error).message },
    ]);
  }

  const result = organizationSchema.safeParse(migrated);
  if (!result.success) {
    const issues: OrgIssue[] = result.error.issues.map((i) => ({
      path: i.path.join('.') || '(root)',
      message: i.message,
    }));
    throw new OrgParseError('The organization file is invalid.', issues);
  }
  return result.data;
}
