import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  CURRENT_SCENARIO_ID,
  type Id,
  type Organization,
  type Person,
  type Relationship,
  type Team,
} from '@/model/types';
import { serializeOrg, parseOrg } from '@/serialization/serialize';
import { createHistory } from './history';
import {
  createOrg,
  renameOrg,
  setColorBy,
  upsertTeam,
  removeTeam,
  upsertRelationship,
  removeRelationship,
  upsertPerson,
  removePerson,
  createScenario,
  renameScenario,
  deleteScenario,
} from './edits';

export type SelectedEntity =
  | { kind: 'team'; id: Id }
  | { kind: 'relationship'; id: Id }
  | { kind: 'person'; id: Id }
  | null;

const HISTORY_LIMIT = 50;

export interface CanopeeState {
  /** `null` = welcome state, no org loaded yet (spec §6). */
  org: Organization | null;
  selectedScenarioId: Id;
  selectedEntity: SelectedEntity;
  /** True when there are changes not yet exported (loss guard, spec §11). */
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** Bumped on every new/import/close so the canvas snaps to the saved zoom
   *  on a real document load — but NOT on a silent zoom update. */
  loadNonce: number;

  // lifecycle
  newOrg(name: string, frameworkId: string): void;
  importOrg(text: string): void;
  exportOrg(): string;
  /** Discard the loaded org and return to the welcome / project picker. */
  closeOrg(): void;

  // org-level
  renameOrg(name: string): void;
  setColorBy(dimensionKey: string): void;

  // scenarios
  selectScenario(scenarioId: Id): void;
  addScenario(name: string): Id;
  renameScenario(scenarioId: Id, name: string): void;
  deleteScenario(scenarioId: Id): void;

  // entities (routed to the selected scenario)
  upsertTeam(team: Team): void;
  removeTeam(teamId: Id): void;
  upsertRelationship(rel: Relationship): void;
  removeRelationship(relId: Id): void;
  upsertPerson(person: Person): void;
  removePerson(personId: Id): void;

  // transient view state
  select(entity: SelectedEntity): void;
  /** Persist the canvas zoom into the file silently: it is written out on
   *  export/autosave but does not mark the document dirty nor enter undo
   *  history (it is a saved preference, not an edit). */
  setViewZoom(zoom: number): void;

  // history
  undo(): void;
  redo(): void;
}

export type CanopeeStore = StoreApi<CanopeeState>;

/**
 * Drop a stale selected scenario after the org changed (falls back to
 * `current`). The selected entity is intentionally preserved — the spec only
 * requires scenario reconciliation, and a transiently dangling entity id is
 * harmless until the UI resolves it.
 */
export function reconcile(
  org: Organization,
  selectedScenarioId: Id,
  selectedEntity: SelectedEntity,
): { selectedScenarioId: Id; selectedEntity: SelectedEntity } {
  const scenarioOk =
    selectedScenarioId === CURRENT_SCENARIO_ID ||
    org.scenarios.some((s) => s.id === selectedScenarioId);
  return {
    selectedScenarioId: scenarioOk ? selectedScenarioId : CURRENT_SCENARIO_ID,
    selectedEntity,
  };
}

export function createCanopeeStore(): CanopeeStore {
  const history = createHistory<Organization>(HISTORY_LIMIT);
  /**
   * The org snapshot that matches the last `.orga.json` file the user
   * exported or imported (by reference — history stores the same objects).
   * `dirty` means "differs from this". `null` = never written to a file
   * (a brand-new org, or work only restored from localStorage autosave).
   */
  let lastCleanOrg: Organization | null = null;

  return createStore<CanopeeState>()((set, get) => {
    /** Apply a pure edit, recording the pre-change org for undo. */
    const edit = (fn: (org: Organization) => Organization): void => {
      const { org } = get();
      if (!org) throw new Error('No organization loaded.');
      history.record(org);
      set({
        org: fn(org),
        dirty: true,
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
      });
    };

    /** Reset the org wholesale (new/import): history starts fresh. */
    const replaceOrg = (org: Organization | null, dirty: boolean): void => {
      // import → matches a file (clean baseline); new → never exported.
      lastCleanOrg = dirty ? null : org;
      history.clear();
      set({
        org,
        selectedScenarioId: CURRENT_SCENARIO_ID,
        selectedEntity: null,
        dirty,
        canUndo: false,
        canRedo: false,
        loadNonce: get().loadNonce + 1,
      });
    };

    return {
      org: null,
      selectedScenarioId: CURRENT_SCENARIO_ID,
      selectedEntity: null,
      dirty: false,
      canUndo: false,
      canRedo: false,
      loadNonce: 0,

      newOrg(name, frameworkId) {
        replaceOrg(createOrg(name, frameworkId), true);
      },
      importOrg(text) {
        const org = parseOrg(text); // throws OrgParseError; current state untouched
        replaceOrg(org, false);
      },
      exportOrg() {
        const { org } = get();
        if (!org) throw new Error('No organization to export.');
        lastCleanOrg = org;
        set({ dirty: false });
        return serializeOrg(org);
      },
      closeOrg() {
        replaceOrg(null, false);
      },

      renameOrg(name) {
        edit((org) => renameOrg(org, name));
      },
      setColorBy(dimensionKey) {
        edit((org) => setColorBy(org, dimensionKey));
      },

      selectScenario(scenarioId) {
        set({ selectedScenarioId: scenarioId, selectedEntity: null });
      },
      addScenario(name) {
        const { org } = get();
        if (!org) throw new Error('No organization loaded.');
        history.record(org);
        const { org: next, scenarioId } = createScenario(org, name);
        set({
          org: next,
          dirty: true,
          canUndo: history.canUndo(),
          canRedo: history.canRedo(),
        });
        return scenarioId;
      },
      renameScenario(scenarioId, name) {
        edit((org) => renameScenario(org, scenarioId, name));
      },
      deleteScenario(scenarioId) {
        const { org, selectedScenarioId, selectedEntity } = get();
        if (!org) throw new Error('No organization loaded.');
        history.record(org);
        const next = deleteScenario(org, scenarioId);
        const r = reconcile(
          next,
          selectedScenarioId === scenarioId ? CURRENT_SCENARIO_ID : selectedScenarioId,
          selectedEntity,
        );
        set({
          org: next,
          dirty: true,
          canUndo: history.canUndo(),
          canRedo: history.canRedo(),
          ...r,
        });
      },

      upsertTeam(team) {
        edit((org) => upsertTeam(org, get().selectedScenarioId, team));
      },
      removeTeam(teamId) {
        edit((org) => removeTeam(org, get().selectedScenarioId, teamId));
      },
      upsertRelationship(rel) {
        edit((org) => upsertRelationship(org, get().selectedScenarioId, rel));
      },
      removeRelationship(relId) {
        edit((org) => removeRelationship(org, get().selectedScenarioId, relId));
      },
      upsertPerson(person) {
        edit((org) => upsertPerson(org, person));
      },
      removePerson(personId) {
        edit((org) => removePerson(org, personId));
      },

      select(entity) {
        set({ selectedEntity: entity });
      },
      setViewZoom(zoom) {
        const { org } = get();
        if (!org || org.view.zoom === zoom) return;
        // Silent preference: new org ref so autosave/export pick it up, but
        // no history.record and `dirty` is left untouched on purpose.
        set({ org: { ...org, view: { ...org.view, zoom } } });
      },

      undo() {
        const { org, selectedScenarioId, selectedEntity } = get();
        if (!org) return;
        const restored = history.undo(org);
        if (!restored) return;
        const r = reconcile(restored, selectedScenarioId, selectedEntity);
        set({
          org: restored,
          dirty: restored !== lastCleanOrg,
          canUndo: history.canUndo(),
          canRedo: history.canRedo(),
          ...r,
        });
      },
      redo() {
        const { org, selectedScenarioId, selectedEntity } = get();
        if (!org) return;
        const restored = history.redo(org);
        if (!restored) return;
        const r = reconcile(restored, selectedScenarioId, selectedEntity);
        set({
          org: restored,
          dirty: restored !== lastCleanOrg,
          canUndo: history.canUndo(),
          canRedo: history.canRedo(),
          ...r,
        });
      },
    };
  });
}
