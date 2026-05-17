import { describe, it, expect } from 'vitest';
import { createHistory } from './history';

describe('createHistory', () => {
  it('starts empty: nothing to undo or redo', () => {
    const h = createHistory<number>(10);
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(false);
    expect(h.undo(1)).toBeNull();
    expect(h.redo(1)).toBeNull();
  });

  it('records a previous value then undoes/redoes around the present', () => {
    const h = createHistory<number>(10);
    h.record(1); // present is now 2 (caller holds it)
    expect(h.canUndo()).toBe(true);
    expect(h.undo(2)).toBe(1); // restore 1, present 2 goes to future
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(true);
    expect(h.redo(1)).toBe(2); // restore 2, present 1 goes back to past
    expect(h.canRedo()).toBe(false);
  });

  it('recording a new change clears the redo future', () => {
    const h = createHistory<number>(10);
    h.record(1);
    h.undo(2); // future = [2]
    expect(h.canRedo()).toBe(true);
    h.record(1); // new branch from present 1
    expect(h.canRedo()).toBe(false);
  });

  it('caps the past stack at the limit (drops oldest)', () => {
    const h = createHistory<number>(2);
    h.record(1);
    h.record(2);
    h.record(3); // past should now hold only [2, 3]
    expect(h.undo(4)).toBe(3);
    expect(h.undo(3)).toBe(2);
    expect(h.canUndo()).toBe(false); // 1 was dropped
  });

  it('clear() empties both stacks', () => {
    const h = createHistory<number>(10);
    h.record(1);
    h.undo(2);
    h.clear();
    expect(h.canUndo()).toBe(false);
    expect(h.canRedo()).toBe(false);
  });
});
