import type { Organization } from '@/model/types';
import { migrate } from '@/serialization/migrate';
import { organizationSchema } from '@/serialization/schema';

/** Minimal subset of the Web Storage API the app depends on. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory `StorageLike`: test double and runtime fallback when localStorage is unusable. */
export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/**
 * Returns the real `localStorage` if it exists AND a probe write succeeds,
 * otherwise `null` (private mode, disabled storage, or non-DOM env like Vitest
 * `node`). The caller falls back to `MemoryStorage` and shows a banner (spec §11).
 */
export function safeLocalStorage(): StorageLike | null {
  try {
    const ls = (globalThis as { localStorage?: StorageLike }).localStorage;
    if (!ls) return null;
    const probe = '__canopee_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Run the pending call now (if any) and clear the timer. */
  flush(): void;
  /** Drop the pending call. */
  cancel(): void;
}

/** Trailing-edge debounce with `flush`/`cancel`, used for autosave. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  const run = (): void => {
    timer = null;
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      fn(...args);
    }
  };

  const debounced = ((...args: A): void => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, ms);
  }) as Debounced<A>;

  debounced.flush = (): void => {
    if (timer) {
      clearTimeout(timer);
      run();
    }
  };
  debounced.cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };
  return debounced;
}

/** Persisted working state: the org model plus which scenario was selected. */
export interface Workspace {
  org: Organization;
  selectedScenarioId: string;
}

export const WORKSPACE_KEY = 'canopee:workspace:v1';

/** Serialize and store the workspace. Returns false if storage throws (quota/full). */
export function saveWorkspace(storage: StorageLike, ws: Workspace): boolean {
  try {
    storage.setItem(WORKSPACE_KEY, JSON.stringify(ws));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and validate the workspace. Returns `null` (never throws) when absent,
 * corrupt, or schema-invalid — caller treats that as "no saved work".
 */
export function loadWorkspace(storage: StorageLike): Workspace | null {
  let raw: string | null;
  try {
    raw = storage.getItem(WORKSPACE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('org' in parsed) ||
    !('selectedScenarioId' in parsed)
  ) {
    return null;
  }

  const candidate = parsed as { org: unknown; selectedScenarioId: unknown };
  if (typeof candidate.selectedScenarioId !== 'string') return null;

  // Migrate first (e.g. autosave written by an older schema) before
  // validating, mirroring parseOrg — otherwise restored work is lost on
  // upgrade.
  let migrated: unknown;
  try {
    migrated = migrate(candidate.org);
  } catch {
    return null;
  }

  const result = organizationSchema.safeParse(migrated);
  if (!result.success) return null;

  return {
    org: result.data as Organization,
    selectedScenarioId: candidate.selectedScenarioId,
  };
}
