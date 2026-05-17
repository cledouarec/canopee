import { attachAutosave, hydrate } from './autosave';
import { MemoryStorage, safeLocalStorage } from './persistence';
import { createCanopeeStore } from './store';

export * from './edits';
export {
  MemoryStorage,
  type StorageLike,
  safeLocalStorage,
  type Workspace,
} from './persistence';
export * from './store';

const realStorage = safeLocalStorage();

/**
 * Whether real `localStorage` is usable. When `false` the app runs on an
 * in-memory store and must show the "auto-save disabled" banner (spec §11).
 */
export const persistenceAvailable = realStorage !== null;

const storage = realStorage ?? new MemoryStorage();

/** Production singleton store, hydrated from storage and auto-saving. */
export const canopeeStore = createCanopeeStore();

// Order matters: hydrate first so attachAutosave captures the restored
// snapshot as its baseline and does not immediately re-save it.
hydrate(canopeeStore, storage);
attachAutosave(canopeeStore, storage);
