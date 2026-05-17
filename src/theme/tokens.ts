import { type Theme, TOKEN_KEYS, type TokenKey } from './types';

/** camelCase token key → kebab CSS custom property name. */
function cssVarName(key: TokenKey): string {
  return '--' + key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/**
 * Theme → `{ '--token': value }` map applied on the root element.
 * When `reducedTransparency` is true the frosted-glass surface degrades to
 * the opaque surface and the blur is disabled (spec §7 fallback).
 */
export function themeCssVars(theme: Theme, reducedTransparency: boolean): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of TOKEN_KEYS) {
    vars[cssVarName(key)] = theme.tokens[key];
  }
  if (reducedTransparency) {
    vars['--surface-glass'] = theme.tokens.surface;
    vars['--surface-blur'] = 'none';
  } else {
    vars['--surface-blur'] = 'blur(18px) saturate(160%)';
  }
  return vars;
}
