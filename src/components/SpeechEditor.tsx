import { tr } from '../shared/locale.ts';
import { useRef, useState } from 'react';
import { DEFAULT_SPEECH, parseSpeech, type Speech } from '../shared/model.ts';
import { Icon } from './Icon.tsx';

export function SpeechEditor({ value, onChange, preview }: { value?: Speech; onChange(value: Speech): void; preview(text: string): void }) {
  const speech = value ?? { ...DEFAULT_SPEECH, messages: DEFAULT_SPEECH.messages.map(text => tr(text)) };
  const [draft, setDraft] = useState(''), [editing, setEditing] = useState<number | null>(null), [error, setError] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  function commit() {
    try {
      const messages = [...speech.messages];
      if (editing === null) messages.push(draft); else messages[editing] = draft;
      const next = parseSpeech({ ...speech, messages }); onChange(next); setDraft(''); setEditing(null); setError('');
    } catch (e) { setError((e as Error).message); }
  }
  function remove(index: number) {
    const messages = speech.messages.filter((_, i) => i !== index); onChange({ ...speech, messages, auto: messages.length ? speech.auto : false });
    if (editing === index) { setEditing(null); setDraft(''); } else if (editing !== null && editing > index) setEditing(editing - 1);
  }
  return <div className="editor-body speech-editor" role="tabpanel" aria-labelledby="speech-tab" id="speech-panel">
    <div className="speech-intro"><Icon name="message" size={21}/><p>{tr("คำพูดเล็ก ๆ ที่เป็นของคุณ")}<br/><span>{tr("คลิกน้องหรือกดปุ่มพูด เพื่ออ่านทีละข้อความ")}</span></p></div>
    <div className="speech-composer"><label className="field-label" htmlFor="speech-draft">{editing === null ? tr("อยากให้น้องพูดอะไร") : tr("แก้ไขข้อความที่ {0}", editing + 1)}<span>{[...draft].length}/120</span></label><textarea ref={input} id="speech-draft" maxLength={120} rows={3} value={draft} placeholder={tr("เช่น พักสายตาหน่อยไหม ♡")} aria-invalid={!!error} aria-describedby={error ? 'speech-error' : undefined} onChange={e => { setDraft(e.target.value); setError(''); }}/>{error && <p className="color-error" id="speech-error" role="alert">{tr(error)}</p>}<div className="speech-composer-actions"><button className="small-button" disabled={!draft.trim()} onClick={() => { try { const parsed = parseSpeech({ ...speech, messages: [draft] }); preview(parsed.messages[0]); } catch (e) { setError((e as Error).message); } }}><Icon name="play" size={14}/>{tr("ลองพูด")}</button><button className="small-button" disabled={!draft.trim() || (editing === null && speech.messages.length >= 20)} onClick={commit}><Icon name={editing === null ? 'plus' : 'check'} size={14}/>{editing === null ? tr("เพิ่มข้อความ") : tr("บันทึกข้อความ")}</button>{editing !== null && <button className="speech-cancel" onClick={() => { setEditing(null); setDraft(''); setError(''); }}>{tr("ยกเลิก")}</button>}</div></div>
    <fieldset><legend>{tr("คำพูดของน้อง")}<span>{speech.messages.length}/20</span></legend><div className="speech-list">{speech.messages.map((text, i) => <article className="speech-item" key={i}><p>{text}</p><div><button className="round-button" aria-label={tr("พูดข้อความที่ {0}", i + 1)} onClick={() => preview(text)}><Icon name="play" size={13}/></button><button className="round-button" aria-label={tr("แก้ไขข้อความที่ {0}", i + 1)} onClick={() => { setDraft(text); setEditing(i); setError(''); input.current?.focus(); }}><Icon name="edit" size={13}/></button><button className="round-button" aria-label={tr("ลบข้อความที่ {0}", i + 1)} onClick={() => remove(i)}><Icon name="trash" size={13}/></button></div></article>)}{!speech.messages.length && <p className="speech-empty">{tr("ยังไม่มีคำพูด เพิ่มข้อความแรกให้น้องได้เลย")}</p>}</div></fieldset>
    <div className="speech-auto"><label><span><b>{tr("ให้น้องพูดวนเอง")}</b><small>{tr("ปิดไว้เมื่อต้องการเพื่อนเงียบ ๆ")}</small></span><input type="checkbox" aria-label={tr("ให้น้องพูดวนเอง")} checked={speech.auto} disabled={!speech.messages.length} onChange={e => onChange({ ...speech, auto: e.target.checked })}/></label><label className="field-label" htmlFor="speech-interval">{tr("เว้นช่วงคำพูด")}<span>{speech.interval}{tr(" วินาที")}</span></label><input id="speech-interval" type="range" min="15" max="180" step="5" value={speech.interval} disabled={!speech.auto} onChange={e => onChange({ ...speech, interval: Number(e.target.value) })}/></div>
    <p className="speech-tip">{tr("คำพูดเก็บไปกับตัวละคร กด “เก็บเพื่อนตัวนี้” เพื่อบันทึกลงคลัง")}</p>
  </div>;
}
