import { tr } from '../shared/locale.ts';
import { useEffect, useRef, useState } from 'react';
import { normalizeHex } from '../shared/model.ts';
import { SITE_COLORS, applySiteColor, parseSiteColor, savedSiteColor } from '../shared/site-color.ts';

export function SiteColorPicker() {
  const [color, setColor] = useState(savedSiteColor), [draft, setDraft] = useState(color), [error, setError] = useState('');
  const details = useRef<HTMLDetailsElement>(null);
  function choose(value: string) {
    const next = parseSiteColor(value); setColor(next); setDraft(next); setError('');
    try { localStorage.setItem('mongbo.site-color', next); } catch { /* The palette still works for this visit. */ }
  }
  function commit() { const hex = normalizeHex(draft); if (hex) choose(hex); else setError('ใช้รหัส HEX เช่น #A3F หรือ #AABBCC'); }
  useEffect(() => { applySiteColor(color); setDraft(color); setError(''); }, [color]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (details.current && !details.current.contains(e.target as Node)) details.current.open = false; };
    const synced = (e: StorageEvent) => { if (e.key === 'mongbo.site-color' || e.key === null) setColor(parseSiteColor(e.newValue)); };
    document.addEventListener('pointerdown', outside); window.addEventListener('storage', synced);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('storage', synced); };
  }, []);
  return <details className="site-color-picker" ref={details} onKeyDown={e => { if (e.key === 'Escape' && details.current) { e.stopPropagation(); details.current.open = false; details.current.querySelector('summary')?.focus(); } }}>
    <summary aria-label={tr("สีเว็บไซต์")} title={tr("เลือกสีเว็บไซต์ แยกจากโหมดสว่างและมืด")}><i style={{ background: color }}/><span>{tr("สีเว็บ")}</span></summary>
    <div className="site-color-panel" role="group" aria-label={tr("เลือกสีเว็บไซต์")}><strong>{tr("สีเว็บไซต์")}</strong><p>{tr("เลือกสีที่ชอบ ใช้ได้ทั้งโหมดสว่างและมืด")}</p>
      <div className="site-color-presets">{SITE_COLORS.map(item => <button key={item.color} type="button" aria-pressed={color === item.color} aria-label={tr("ธีมสี{0}", tr(item.label))} onClick={() => choose(item.color)}><i style={{ background: item.color }}/>{tr(item.label)}</button>)}</div>
      <label className="site-color-custom">{tr("สีของคุณ")}<input type="color" aria-label={tr("เลือกสีเว็บไซต์อิสระ")} value={color} onChange={e => choose(e.target.value)}/></label>
      <div className="site-color-hex"><label htmlFor="site-color-hex">HEX</label><input id="site-color-hex" aria-label={tr("รหัสสีเว็บไซต์")} aria-invalid={!!error} aria-describedby={error ? 'site-color-error' : undefined} spellCheck={false} maxLength={7} value={draft} onChange={e => { const value = e.target.value; setDraft(value); setError(''); if (/^#?[0-9a-f]{6}$/i.test(value)) choose(value); }} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); }}/></div>
      {error && <p className="color-error" id="site-color-error" role="status">{tr(error)}</p>}
    </div>
  </details>;
}
