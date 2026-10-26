import { tr } from '../shared/locale.ts';
import { useEffect, useId, useState } from 'react';
import { COLORS, normalizeHex } from '../shared/model.ts';
import { Icon } from './Icon.tsx';

export function ColorPicker({ value, onChange, label, presets = true }: { value: string; onChange(color: string): void; label: string; presets?: boolean }) {
  const id = useId(), [draft, setDraft] = useState(value), [error, setError] = useState('');
  const [saved, setSaved] = useState<string[]>(() => {
    try { const colors: unknown = JSON.parse(localStorage.getItem('mongbo.colors') || '[]'); return Array.isArray(colors) ? colors.filter((c): c is string => typeof c === 'string' && normalizeHex(c) === c).slice(0, 16) : []; } catch { return []; }
  });
  useEffect(() => { setDraft(value); setError(''); }, [value]);
  function apply() { const color = normalizeHex(draft); if (!color) { setError('ใช้รหัส HEX เช่น #A3F หรือ #AABBCC'); return; } setDraft(color); setError(''); onChange(color); }
  function remember() {
    const color = normalizeHex(draft); if (!color) { apply(); return; }
    apply();
    if (saved.includes(color) || COLORS.includes(color as typeof COLORS[number])) return;
    if (saved.length >= 16) { setError('เก็บสีเพิ่มได้ 16 สี แต่ยังเลือกใช้สีอื่นได้เสมอ'); return; }
    try { const next = [...saved, color]; localStorage.setItem('mongbo.colors', JSON.stringify(next)); setSaved(next); } catch { setError('เก็บพาเลตไม่ได้ แต่ยังเลือกใช้สีนี้ได้'); }
  }
  return <fieldset className="color-picker"><legend>{label}<span>{value}</span></legend>
    {presets && <div className="colors">{COLORS.map((color, index) => <button type="button" key={color} style={{ background: color }} className={value.toLowerCase() === color ? 'swatch selected' : 'swatch'} aria-label={tr("สี {0} {1}", index + 1, color)} aria-pressed={value.toLowerCase() === color} onClick={() => onChange(color)}>{value.toLowerCase() === color && <Icon name="check" size={16}/>}</button>)}</div>}
    <div className="custom-color-row"><label className="spectrum-picker" title={tr("เลือกสีอิสระ")}><input type="color" value={value} aria-label={tr("เลือก{0}อิสระ", label)} onChange={e => onChange(e.target.value)}/><Icon name="plus" size={15}/></label><div className="hex-field"><label htmlFor={id}>HEX</label><input id={id} value={draft} maxLength={7} aria-label={tr("รหัส{0}", label)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} spellCheck={false} onChange={e => { setDraft(e.target.value); setError(''); const v = e.target.value; if (/^#?[0-9a-f]{6}$/i.test(v)) onChange(normalizeHex(v)!); }} onBlur={apply} onKeyDown={e => { if (e.key === 'Enter') apply(); }}/></div><button className="small-button" onClick={remember} type="button" aria-label={tr("เก็บ{0}ไว้ในพาเลต", label)} title={tr("เก็บสีไว้ในพาเลต")}><Icon name="plus" size={14}/>{tr("เก็บสี")}</button></div>
    {error && <p className="color-error" id={`${id}-error`}>{tr(error)}</p>}
    {presets && saved.length > 0 && <div className="saved-colors" aria-label={tr("สีที่เก็บไว้")}>{saved.map(color => <button type="button" key={color} className={`swatch ${value === color ? 'selected' : ''}`} style={{ background: color }} aria-label={tr("สีที่เก็บไว้ {0}", color)} aria-pressed={value === color} onClick={() => onChange(color)}>{value === color && <Icon name="check" size={14}/>}</button>)}</div>}
  </fieldset>;
}
