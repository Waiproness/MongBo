import { tr } from '../shared/locale.ts';
import { useState } from 'react';
import { ACCESSORIES, DEFAULT_FIT, EYEWEAR, LABELS, OUTFITS, type Pet as PetData, type WearAdjustment } from '../shared/model.ts';
import type { PetChange } from './AppearanceEditor.tsx';
import { Pet } from './Pet.tsx';
import { ColorPicker } from './ColorPicker.tsx';
import { Icon } from './Icon.tsx';
export function WardrobeEditor({ pet, onChange }: { pet: PetData; onChange: PetChange }) {
  const [category, setCategory] = useState<'outfit' | 'accessory' | 'eyewear'>('outfit');
  const catalog = category === 'outfit' ? OUTFITS : category === 'accessory' ? ACCESSORIES : EYEWEAR;
  const adjustment = pet.fit?.[category] ?? DEFAULT_FIT;
  const categoryLabel = category === 'outfit' ? tr("ชุด") : category === 'accessory' ? tr("ของสวมศีรษะ") : tr("แว่น");
  function adjust(key: keyof WearAdjustment, value: number) { onChange('fit', { ...pet.fit, [category]: { ...adjustment, [key]: value } }); }
  function reset() { const next = { ...pet.fit }; delete next[category]; onChange('fit', Object.keys(next).length ? next : undefined); }
  return <div className="editor-body wardrobe-body" role="tabpanel" aria-labelledby="wardrobe-tab" id="wardrobe-panel"><div className="wardrobe-categories" aria-label={tr("หมวดของสวมใส่")}>{([{ id: 'outfit', title: tr("ชุด"), count: OUTFITS.length - 1 }, { id: 'accessory', title: tr("ศีรษะ"), count: ACCESSORIES.length - 1 }, { id: 'eyewear', title: tr("แว่น"), count: EYEWEAR.length - 1 }] as const).map(c => <button key={c.id} className={category === c.id ? 'selected' : ''} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.title}<span>{c.count}</span></button>)}</div>
    <fieldset><legend>{category === 'outfit' ? tr("วันนี้แต่งตัวแบบไหนดี") : category === 'accessory' ? tr("เติมอะไรบนหัวอีกนิด") : tr("แว่นคู่ใจของเพื่อน")}</legend><div className="wardrobe-grid">{catalog.map(item => <button key={item} className={`wardrobe-option ${pet[category] === item ? 'selected' : ''}`} aria-label={tr(LABELS[item])} aria-pressed={pet[category] === item} onClick={() => { if (category === 'outfit') onChange('outfit', item as PetData['outfit']); else if (category === 'accessory') onChange('accessory', item as PetData['accessory']); else onChange('eyewear', item as PetData['eyewear']); }}><Pet pet={{ ...pet, name: pet.name.trim() || tr("เพื่อน"), accessory: category === 'accessory' ? item as PetData['accessory'] : 'none', outfit: category === 'outfit' ? item as PetData['outfit'] : 'none', eyewear: category === 'eyewear' ? item as PetData['eyewear'] : 'none' }}/><span>{tr(LABELS[item])}</span></button>)}</div></fieldset>
    {category !== 'eyewear' && <ColorPicker label={category === 'outfit' ? tr("สีชุด") : tr("สีของสวมศีรษะ")} value={category === 'outfit' ? pet.outfitColor : pet.accessoryColor} onChange={color => onChange(category === 'outfit' ? 'outfitColor' : 'accessoryColor', color)}/>}
    {pet[category] !== 'none' && <details className="fit-panel" key={category} open><summary><Icon name="settings" size={16}/>{tr("ปรับให้พอดีตัว")}</summary><p>{tr("จัดให้ตามรูปร่างแล้ว ขยับเพิ่มได้ตามใจ")}</p>{([{ key: 'x', title: tr("ซ้าย / ขวา"), min: -40, max: 40, scale: false }, { key: 'y', title: tr("ขึ้น / ลง"), min: -40, max: 40, scale: false }, { key: 'scaleX', title: tr("ความกว้าง"), min: 50, max: 180, scale: true }, { key: 'scaleY', title: tr("ความสูง"), min: 50, max: 180, scale: true }] as const).map(control => { const value = control.scale ? Math.round(adjustment[control.key] * 100) : adjustment[control.key]; return <label className="fit-control" key={control.key}><span>{control.title}<output>{control.scale ? `${value}%` : value > 0 ? `+${value}` : value}</output></span><input type="range" aria-label={tr("ปรับ{0}{1}", categoryLabel, control.title)} min={control.min} max={control.max} value={value} onChange={e => adjust(control.key, Number(e.target.value) / (control.scale ? 100 : 1))}/></label>; })}<button className="small-button" onClick={reset}>{tr("คืนค่าพอดีตัว")}</button></details>}
    <p className="wardrobe-tip">{tr("ชุด ของสวมศีรษะ และแว่น ใส่ด้วยกันได้")}</p>
  </div>;
}
