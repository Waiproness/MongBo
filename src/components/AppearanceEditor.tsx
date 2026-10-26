import { tr } from '../shared/locale.ts';
import { DEFAULT_PET, FACES, LABELS, SPECIES, type Pet as PetData } from '../shared/model.ts';
import { ColorPicker } from './ColorPicker.tsx';
import { Pet } from './Pet.tsx';
import { Icon } from './Icon.tsx';
export type PetChange = <K extends keyof PetData>(key: K, value: PetData[K]) => void;
const FACE_SYMBOLS: Record<PetData['face'], string> = { happy: '◡', sleepy: '–', curious: 'o', shy: '>', calm: '⌣', excited: '^', love: '♡', wink: ';)', laughing: 'D', proud: '⌝', focused: '⌐', bored: '−', sad: '⌢', crying: 'T', worried: '~', scared: '!', angry: '〈', surprised: 'O', confused: '?', dizzy: '@' };
export function AppearanceEditor({ pet, onChange, draw }: { pet: PetData; onChange: PetChange; draw(): void }) {
  return <div className="editor-body" role="tabpanel" aria-labelledby="look-tab" id="look-panel">
    <fieldset><legend>{tr("เริ่มจากเพื่อนแบบไหน")}<span>{SPECIES.length}{tr(" แบบ + วาดเอง")}</span></legend><div className="species-grid expanded-species">{SPECIES.map(species => <button className={`species-option ${pet.species === species ? 'selected' : ''}`} key={species} onClick={() => onChange('species', species)} aria-pressed={pet.species === species}><Pet pet={{ ...DEFAULT_PET, species, accessory: 'none', color: pet.color }}/><span>{tr(LABELS[species])}</span></button>)}</div><button className={`draw-your-own ${pet.species === 'custom' ? 'selected' : ''}`} onClick={draw}><Icon name="image" size={21}/><span><b>{pet.species === 'custom' ? tr("แก้ไขตัวละครที่วาดเอง") : tr("หรือวาดเพื่อนขึ้นมาเอง")}</b><small>{tr("กระดาน Pixel Art · วาดแล้วพาไปเดินได้")}</small></span><Icon name="arrow" size={17}/></button></fieldset>
    {pet.species !== 'custom' ? <><ColorPicker label={tr("สีตัวละคร")} value={pet.color} onChange={color => onChange('color', color)}/><fieldset><legend>{tr("วันนี้อารมณ์ไหน")}<span>{FACES.length}{tr(" อารมณ์")}</span></legend><div className="face-grid">{FACES.map(face => <button className={pet.face === face ? 'chip selected' : 'chip'} key={face} aria-pressed={pet.face === face} onClick={() => onChange('face', face)}><span className="face-symbol" aria-hidden="true">{FACE_SYMBOLS[face]}</span>{tr(LABELS[face])}</button>)}</div></fieldset></> : <div className="drawing-hint"><Icon name="heart" size={18}/><p>{tr("สีและใบหน้าของเพื่อนตัวนี้วาดเองได้ในกระดาน")}<br/>{tr("เลือกชุดหรือของสวมใส่เพิ่มได้ที่แท็บ “ชุดและของ”")}</p></div>}
  </div>;
}
