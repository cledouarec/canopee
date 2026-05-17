import type { Theme } from './types';
import { themeCssVars } from './tokens';

/** Write the theme's CSS custom properties + base attribute onto `el`. */
export function applyTheme(
  el: HTMLElement,
  theme: Theme,
  reducedTransparency: boolean,
): void {
  const vars = themeCssVars(theme, reducedTransparency);
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }
  el.setAttribute('data-theme-base', theme.base);
}
