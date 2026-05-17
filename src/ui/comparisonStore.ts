import { createStore, type StoreApi } from 'zustand/vanilla';
import { CURRENT_SCENARIO_ID, type Id } from '@/model/types';

export interface ComparisonState {
  leftId: Id;
  rightId: Id;
  setLeft(id: Id): void;
  setRight(id: Id): void;
}

export type ComparisonStore = StoreApi<ComparisonState>;

export function createComparisonStore(): ComparisonStore {
  return createStore<ComparisonState>()((set) => ({
    leftId: CURRENT_SCENARIO_ID,
    rightId: CURRENT_SCENARIO_ID,
    setLeft: (id) => set({ leftId: id }),
    setRight: (id) => set({ rightId: id }),
  }));
}
