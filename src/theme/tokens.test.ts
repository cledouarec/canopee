import { describe, expect, it } from 'vitest';
import { getTheme } from './registry';
import { themeCssVars } from './tokens';

const sage = getTheme('sage-light')!;

describe('themeCssVars', () => {
  it('maps every token to a prefixed CSS custom property', () => {
    const vars = themeCssVars(sage, false);
    expect(vars['--accent']).toBe('#15c08a');
    expect(vars['--bg']).toBe('#eef3ec');
    expect(vars['--surface-glass']).toBe('rgba(255,255,255,.16)');
  });

  it('kebab-cases multi-word token keys (accentText → --accent-text)', () => {
    const vars = themeCssVars(sage, false);
    expect(vars['--accent-text']).toBe(sage.tokens.accentText);
    expect(vars['--accentText']).toBeUndefined();
  });

  it('keeps the translucent glass surface when transparency is allowed', () => {
    expect(themeCssVars(sage, false)['--surface-glass']).toContain('rgba');
  });

  it('falls back to the opaque surface when reduced transparency is requested', () => {
    const vars = themeCssVars(sage, true);
    expect(vars['--surface-glass']).toBe(sage.tokens.surface);
  });

  it('exposes a backdrop-filter blur only when transparency is allowed', () => {
    expect(themeCssVars(sage, false)['--surface-blur']).toBe('blur(18px) saturate(160%)');
    expect(themeCssVars(sage, true)['--surface-blur']).toBe('none');
  });
});
