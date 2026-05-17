import type { Theme } from './types';

const sageLight: Theme = {
  id: 'sage-light',
  label: 'Sage Light',
  base: 'light',
  tokens: {
    bg: '#eef3ec',
    surface: '#ffffff',
    surfaceGlass: 'rgba(255,255,255,.16)',
    text: '#1f2a24',
    muted: '#5d6b62',
    border: 'rgba(31,42,36,.14)',
    accent: '#15c08a',
    accentText: '#ffffff',
    danger: '#d9534f',
    dangerText: '#ffffff',
    error: '#c0392b',
    scrim: 'rgba(0,0,0,.4)',
    panelRim: 'rgba(255,255,255,.45)',
    panelShadow:
      '0 10px 30px rgba(30,45,20,.14), inset 0 1px 1px rgba(255,255,255,.6)',
    cardShadow: '0 1px 3px rgba(0,0,0,.18)',
    statusAdded: '#15c08a',
    statusRemoved: '#9aa0a6',
    statusModified: '#e0a106',
  },
};

const duskDark: Theme = {
  id: 'dusk-dark',
  label: 'Dusk Dark',
  base: 'dark',
  tokens: {
    bg: '#161821',
    surface: '#1f222e',
    surfaceGlass: 'rgba(31,34,46,.34)',
    text: '#e8e9f0',
    muted: '#a3a7b8',
    border: 'rgba(232,233,240,.16)',
    accent: '#1ed79b',
    accentText: '#0b0d14',
    danger: '#e06560',
    dangerText: '#ffffff',
    error: '#ff8a80',
    scrim: 'rgba(0,0,0,.55)',
    panelRim: 'rgba(255,255,255,.12)',
    panelShadow:
      '0 10px 30px rgba(0,0,0,.4), inset 0 1px 1px rgba(255,255,255,.08)',
    cardShadow: '0 1px 3px rgba(0,0,0,.5)',
    statusAdded: '#1ed79b',
    statusRemoved: '#9aa0a6',
    statusModified: '#f0b429',
  },
};

/** The two shipped themes — toggled via the sun/moon button. */
export const THEMES: Theme[] = [sageLight, duskDark];

export const DEFAULT_THEME_ID = 'sage-light';

export function getTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
