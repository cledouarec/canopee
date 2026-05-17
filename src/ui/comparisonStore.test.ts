import { describe, it, expect } from 'vitest';
import { createComparisonStore } from './comparisonStore';

describe('comparison store', () => {
  it('defaults both sides to the current scenario', () => {
    const s = createComparisonStore();
    expect(s.getState().leftId).toBe('current');
    expect(s.getState().rightId).toBe('current');
  });

  it('updates the left and right scenario ids', () => {
    const s = createComparisonStore();
    s.getState().setLeft('current');
    s.getState().setRight('s-q3');
    expect(s.getState().leftId).toBe('current');
    expect(s.getState().rightId).toBe('s-q3');
  });
});
