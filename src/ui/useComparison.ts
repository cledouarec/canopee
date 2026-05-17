import { useStore } from 'zustand';
import { type ComparisonState, createComparisonStore } from './comparisonStore';

/** Production singleton comparison store (transient, not persisted). */
export const comparisonStore = createComparisonStore();

export function useComparison<T>(selector: (s: ComparisonState) => T): T {
  return useStore(comparisonStore, selector);
}
