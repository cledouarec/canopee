import { describe, it, expect } from 'vitest';
import {
  canopeeStore,
  persistenceAvailable,
  createCanopeeStore,
  createOrg,
} from './index';

describe('store barrel', () => {
  it('re-exports the factory and edit helpers', () => {
    expect(typeof createCanopeeStore).toBe('function');
    expect(typeof createOrg).toBe('function');
  });

  it('exposes a working singleton store', () => {
    expect(canopeeStore.getState().org).toBeNull();
    canopeeStore.getState().newOrg('Acme', 'custom');
    expect(canopeeStore.getState().org!.name).toBe('Acme');
  });

  it('reports whether real localStorage was available (false under Vitest node)', () => {
    expect(typeof persistenceAvailable).toBe('boolean');
    expect(persistenceAvailable).toBe(false);
  });
});
