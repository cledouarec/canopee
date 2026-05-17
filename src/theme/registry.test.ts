import { describe, it, expect } from 'vitest';
import { THEMES, getTheme, DEFAULT_THEME_ID } from './registry';
import { TOKEN_KEYS } from './types';

describe('theme registry', () => {
  it('ships exactly the Sage Light / Dusk Dark pair', () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toEqual(['sage-light', 'dusk-dark']);
    expect(THEMES.map((t) => t.base)).toEqual(['light', 'dark']);
  });

  it('default theme is sage-light', () => {
    expect(DEFAULT_THEME_ID).toBe('sage-light');
    expect(getTheme(DEFAULT_THEME_ID)?.base).toBe('light');
  });

  it('every theme defines every token key', () => {
    for (const theme of THEMES) {
      for (const key of TOKEN_KEYS) {
        expect(theme.tokens[key], `${theme.id} missing ${key}`).toBeTypeOf('string');
      }
    }
  });

  it('both themes use the emerald accent family', () => {
    expect(getTheme('sage-light')!.tokens.accent.toLowerCase()).toBe('#15c08a');
    expect(getTheme('dusk-dark')!.tokens.accent.toLowerCase()).toBe('#1ed79b');
  });

  it('getTheme returns undefined for an unknown id', () => {
    expect(getTheme('nope')).toBeUndefined();
  });
});
