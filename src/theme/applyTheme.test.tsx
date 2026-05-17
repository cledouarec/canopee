import { describe, it, expect } from 'vitest';
import { applyTheme } from './applyTheme';
import { getTheme } from './registry';

describe('applyTheme', () => {
  it('writes every CSS var and the base attribute onto the element', () => {
    const el = document.createElement('div');
    applyTheme(el, getTheme('dusk-dark')!, false);
    expect(el.style.getPropertyValue('--accent')).toBe('#1ed79b');
    expect(el.style.getPropertyValue('--bg')).toBe('#161821');
    expect(el.getAttribute('data-theme-base')).toBe('dark');
  });

  it('writes the semantic color tokens (danger / scrim / status / panel)', () => {
    const el = document.createElement('div');
    applyTheme(el, getTheme('sage-light')!, false);
    expect(el.style.getPropertyValue('--danger')).toBe('#d9534f');
    expect(el.style.getPropertyValue('--scrim')).toBe('rgba(0,0,0,.4)');
    expect(el.style.getPropertyValue('--status-added')).toBe('#15c08a');
    expect(el.style.getPropertyValue('--panel-rim')).toBe('rgba(255,255,255,.45)');
  });

  it('applies the reduced-transparency fallback', () => {
    const el = document.createElement('div');
    const sage = getTheme('sage-light')!;
    applyTheme(el, sage, true);
    expect(el.style.getPropertyValue('--surface-glass')).toBe(sage.tokens.surface);
    expect(el.style.getPropertyValue('--surface-blur')).toBe('none');
  });
});
