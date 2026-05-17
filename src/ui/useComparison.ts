import { useStore } from 'zustand';
import { createComparisonStore, type ComparisonState } from './comparisonStore';

/** Production singleton comparison store (transient, not persisted). */
export const comparisonStore = createComparisonStore();

export function useComparison<T>(selector: (s: ComparisonState) => T): T {
  return useStore(comparisonStore, selector);
}
