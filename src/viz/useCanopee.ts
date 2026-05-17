import { useStore } from 'zustand';
import { type CanopeeState, canopeeStore } from '@/store';

/** React binding for the vanilla Canopée store. */
export function useCanopee<T>(selector: (state: CanopeeState) => T): T {
  return useStore(canopeeStore, selector);
}
