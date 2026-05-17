import { useStore } from 'zustand';
import { canopeeStore, type CanopeeState } from '@/store';

/** React binding for the vanilla Canopée store. */
export function useCanopee<T>(selector: (state: CanopeeState) => T): T {
  return useStore(canopeeStore, selector);
}
