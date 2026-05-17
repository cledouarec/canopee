/**
 * Generic snapshot undo/redo stack.
 *
 * The caller owns the "present" value. Before applying a change, call
 * `record(previous)` with the value as it was *before* the change. To undo,
 * call `undo(present)` — it returns the value to restore (or `null` if the
 * past is empty) and pushes `present` onto the redo stack. `redo` is symmetric.
 *
 * No app types: usable for any immutable snapshot.
 */
export interface History<T> {
  /** Push the pre-change value; clears the redo future. */
  record(previous: T): void;
  /** Returns the value to restore, or null if nothing to undo. */
  undo(present: T): T | null;
  /** Returns the value to restore, or null if nothing to redo. */
  redo(present: T): T | null;
  canUndo(): boolean;
  canRedo(): boolean;
  /** Empties both stacks. */
  clear(): void;
}

export function createHistory<T>(limit: number): History<T> {
  let past: T[] = [];
  let future: T[] = [];

  return {
    record(previous: T): void {
      past.push(previous);
      if (past.length > limit) past = past.slice(past.length - limit);
      future = [];
    },
    undo(present: T): T | null {
      if (past.length === 0) return null;
      const restored = past.pop() as T;
      future.push(present);
      return restored;
    },
    redo(present: T): T | null {
      if (future.length === 0) return null;
      const restored = future.pop() as T;
      past.push(present);
      return restored;
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    clear(): void {
      past = [];
      future = [];
    },
  };
}
