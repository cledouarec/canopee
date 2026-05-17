import { describe, expect, it } from 'vitest';
import { buildCustomTheme, CUSTOM_THEME_ID } from './customTheme';
import { TOKEN_KEYS } from './types';

describe('buildCustomTheme', () => {
  it('produces a full theme from a light base + accent', () => {
    const t = buildCustomTheme({ base: 'light', accent: '#aa3322' });
    expect(t.id).toBe(CUSTOM_THEME_ID);
    expect(t.base).toBe('light');
    expect(t.tokens.accent).toBe('#aa3322');
    for (const k of TOKEN_KEYS) expect(t.tokens[k]).toBeTypeOf('string');
  });

  it('uses dark surfaces when base is dark', () => {
    const light = buildCustomTheme({ base: 'light', accent: '#15c08a' });
    const dark = buildCustomTheme({ base: 'dark', accent: '#15c08a' });
    expect(dark.tokens.bg).not.toBe(light.tokens.bg);
    expect(dark.base).toBe('dark');
  });

  it('falls back to a safe accent when given a malformed color', () => {
    const t = buildCustomTheme({ base: 'light', accent: 'not-a-color' });
    expect(t.tokens.accent).toBe('#15c08a');
  });
});
