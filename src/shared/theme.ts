import { applySiteColor, savedSiteColor } from './site-color.ts';

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = typeof THEMES[number];
export function parseTheme(value: unknown): Theme { return THEMES.includes(value as Theme) ? value as Theme : 'system'; }
export function resolveTheme(theme: Theme, dark: boolean): 'light' | 'dark' { return theme === 'system' ? dark ? 'dark' : 'light' : theme; }
export function savedTheme(): Theme { try { return parseTheme(localStorage.getItem('mongbo.theme')); } catch { return 'system'; } }
export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme, matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  applySiteColor(document.documentElement.dataset.siteColor ?? savedSiteColor());
}

