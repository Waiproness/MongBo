import { normalizeHex } from './model.ts';

export const SITE_COLORS = [
  { color: '#a58ac9', label: 'ม่วง' }, { color: '#7caed6', label: 'ฟ้า' },
  { color: '#d695b4', label: 'ชมพู' }, { color: '#d6a07f', label: 'พีช' },
  { color: '#c1ae8d', label: 'ทราย' }, { color: '#9b9fa8', label: 'เทา' },
] as const;
export const DEFAULT_SITE_COLOR = SITE_COLORS[0].color;
export function parseSiteColor(value: unknown): string { return typeof value === 'string' ? normalizeHex(value) ?? DEFAULT_SITE_COLOR : DEFAULT_SITE_COLOR; }
export function savedSiteColor(): string { try { return parseSiteColor(localStorage.getItem('mongbo.site-color')); } catch { return DEFAULT_SITE_COLOR; } }

export function siteColorTokens(value: string, dark: boolean): Record<string, string> {
  const color = parseSiteColor(value);
  const mix = (neutral: string, amount: number) => '#' + [1, 3, 5].map(i => Math.round(parseInt(color.slice(i, i + 2), 16) * amount + parseInt(neutral.slice(i, i + 2), 16) * (1 - amount)).toString(16).padStart(2, '0')).join('');
  const ink = mix(dark ? '#f8f5fa' : '#25232a', dark ? .08 : .2);
  const accentInk = mix(dark ? '#faf3ff' : '#28212e', dark ? .12 : .3);
  return {
    '--page': mix(dark ? '#242329' : '#f4f3f5', .13),
    '--surface': mix(dark ? '#302e35' : '#ffffff', dark ? .14 : .035),
    '--tile': mix(dark ? '#39353e' : '#f5f3f5', dark ? .18 : .09),
    '--ink': ink, '--muted': mix(dark ? '#d7cedd' : '#5f5966', .16),
    '--line': mix(dark ? '#514b58' : '#d6d1da', .22),
    '--white': mix(dark ? '#302e35' : '#ffffff', dark ? .14 : .035),
    '--green': ink, '--purple': color,
    '--lavender': mix(dark ? '#48404f' : '#f4f2f5', dark ? .2 : .35),
    '--mint': mix(dark ? '#3d3843' : '#f3f0eb', dark ? .2 : .18),
    '--peach': mix(dark ? '#51414a' : '#f7ede8', .25),
    '--accent-ink': accentInk, '--mint-ink': ink,
    '--shade': mix(dark ? '#130d22' : '#8a8094', .25) + (dark ? '5c' : '42'),
    '--depth': mix(dark ? '#100a1b' : '#8e7ca4', .2) + (dark ? '70' : '2e'),
    '--focus': mix(dark ? '#eddbff' : '#35233f', dark ? .25 : .4),
    '--checker': mix(dark ? '#49434f' : '#e1dbe9', .2),
    '--room-rug': mix(dark ? '#514956' : '#e2dce8', .22),
    '--room-rug-line': mix(dark ? '#7c7085' : '#bdb2c6', .22),
    '--room-sky': mix(dark ? '#55515e' : '#e3deeb', .18),
  };
}

export function applySiteColor(value: string) {
  const root = document.documentElement, color = parseSiteColor(value);
  root.dataset.siteColor = color;
  const tokens = siteColorTokens(color, root.dataset.theme === 'dark');
  for (const [key, value] of Object.entries(tokens)) root.style.setProperty(key, value);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens['--page']);
}
