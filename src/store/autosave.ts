import { reconcile, type CanopeeStore } from './store';
import {
  type StorageLike,
  debounce,
  loadWorkspace,
  saveWorkspace,
} from './persistence';

/**
 * Load a previously saved workspace into the store. Returns `true` if work was
 * restored, `false` if nothing valid was stored (caller shows the welcome
 * screen — spec §6). Never throws.
 */
export function hydrate(store: CanopeeStore, storage: StorageLike): boolean {
  const ws = loadWorkspace(storage);
  if (!ws) return false;
  const r = reconcile(ws.org, ws.selectedScenarioId, null);
  store.setState({
    org: ws.org,
    selectedScenarioId: r.selectedScenarioId,
    selectedEntity: r.selectedEntity,
    dirty: false,
    canUndo: false,
    canRedo: false,
  });
  return true;
}

/**
 * Subscribe the store to `storage`: every change to `org` or
 * `selectedScenarioId` triggers a debounced write. No-ops while `org` is null.
 * Returns a disposer that cancels the pending write and unsubscribes.
 */
export function attachAutosave(
  store: CanopeeStore,
  storage: StorageLike,
  debounceMs = 800,
): () => void {
  const persist = debounce(() => {
    const { org, selectedScenarioId } = store.getState();
    if (!org) return;
    saveWorkspace(storage, { org, selectedScenarioId });
  }, debounceMs);

  let prevOrg = store.getState().org;
  let prevScenario = store.getState().selectedScenarioId;

  const unsubscribe = store.subscribe((state) => {
    if (state.org !== prevOrg || state.selectedScenarioId !== prevScenario) {
      prevOrg = state.org;
      prevScenario = state.selectedScenarioId;
      if (state.org) persist();
    }
  });

  return () => {
    persist.cancel();
    unsubscribe();
  };
}
