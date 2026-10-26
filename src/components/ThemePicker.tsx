import { tr } from '../shared/locale.ts';
import { useEffect, useState } from 'react';
import { THEMES, applyTheme, parseTheme, savedTheme } from '../shared/theme.ts';
import { Icon } from './Icon.tsx';
export function ThemePicker() {
  const [theme, setTheme] = useState(savedTheme);
  useEffect(() => {
    applyTheme(theme);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const changed = () => { if (theme === 'system') applyTheme(theme); };
    media.addEventListener('change', changed);
    const synced = (e: StorageEvent) => { if (e.key === 'mongbo.theme' || e.key === null) setTheme(parseTheme(e.newValue)); };
    window.addEventListener('storage', synced);
    return () => { media.removeEventListener('change', changed); window.removeEventListener('storage', synced); };
  }, [theme]);
  return <label className="theme-picker" title={tr("เลือกธีมเว็บไซต์")}><Icon name={theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'monitor'} size={16}/><select aria-label={tr("ธีมเว็บไซต์")} value={theme} onChange={e => { const next = parseTheme(e.target.value); setTheme(next); try { localStorage.setItem('mongbo.theme', next); } catch { /* Theme still works for this visit when storage is unavailable. */ } }}>{THEMES.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}</select></label>;
}
