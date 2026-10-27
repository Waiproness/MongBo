import { tr, applyDocumentLanguage, savedLanguage, setLanguage } from './shared/locale.ts';
import { useLanguage } from './shared/useLanguage.ts';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Pet } from './components/Pet.tsx';
import { Icon } from './components/Icon.tsx';
import { DEFAULT_PET, DEFAULT_PREFS, MAX_PET_FILE_BYTES, parseFile, type Pet as PetData, type Preferences } from './shared/model.ts';
import { extensionAPI, readExtension, writePreferences } from './shared/browser.ts';
import { addCompanion } from './shared/companions.ts';
import { desktopBridge } from './desktop-api.ts';
import './popup.css';
function Popup() {
  useLanguage();
  const [pet, setPet] = useState(DEFAULT_PET), [preferences, setPreferences] = useState(DEFAULT_PREFS), [hostname, setHostname] = useState('');
  const [message, setMessage] = useState(''), [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const [collection, setCollection] = useState<PetData[]>([]), [activeIds, setActiveIds] = useState<string[]>([]), [deleting, setDeleting] = useState('');
  const input = useRef<HTMLInputElement>(null), api = extensionAPI();
  const desktop = !!desktopBridge();
  useEffect(() => { if (!api) { setMessage('เปิดหน้านี้จากไอคอนส่วนขยาย MongBo'); return; }
    Promise.all([readExtension(), api.tabs.query({ active: true, currentWindow: true })]).then(([data, tabs]) => {
      setLanguage(data.language); setPet(data.pet); setPreferences(data.preferences); setCollection([...data.collection, ...data.activePets.filter(p => !data.collection.some(c => c.id === p.id))]); setActiveIds(data.activePets.map(p => p.id));
      try { const url = new URL(tabs[0]?.url || ''); if (['http:', 'https:'].includes(url.protocol)) setHostname(url.hostname); } catch { /* Browser-owned tabs have no usable hostname. */ }
      setReady(true);
    }).catch(() => setMessage('โหลดข้อมูลไม่ได้ ปิดแล้วเปิดส่วนขยายอีกครั้ง'));
  }, []);
  useEffect(() => {
    if (!api) return;
    let closed = false;
    const changed = () => { void readExtension().then(data => {
      if (closed) return;
      setLanguage(data.language); setPet(data.pet); setPreferences(data.preferences);
      setCollection([...data.collection, ...data.activePets.filter(p => !data.collection.some(c => c.id === p.id))]);
      setActiveIds(data.activePets.map(p => p.id));
    }).catch(() => setMessage('โหลดข้อมูลไม่ได้ ปิดแล้วเปิดส่วนขยายอีกครั้ง')); };
    api.storage.onChanged.addListener(changed);
    return () => { closed = true; api.storage.onChanged.removeListener(changed); };
  }, []);
  async function update(next: Preferences) { setBusy(true); try { await writePreferences(next); setPreferences(next); setMessage('บันทึกแล้ว'); } catch { setMessage('บันทึกไม่ได้ กรุณาลองใหม่'); } finally { setBusy(false); } }
  async function importPet(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file || !api) return;
    setBusy(true);
    try { if (file.size > MAX_PET_FILE_BYTES) throw new Error('ไฟล์ต้องไม่เกิน 32 KB'); const imported = parseFile(await file.text()); const data = await readExtension(); const next = addCompanion(data.pet, data.collection, data.activePets, imported); await api.storage.local.set(next); setCollection(next.collection); setActiveIds(next.activeIds); setMessage('เพิ่มเพื่อนแล้ว ตัวเดิมยังอยู่ด้วย ♡'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'นำเข้าไม่ได้'); } finally { setBusy(false); }
  }
  async function manage(id: string, remove = false) {
    if (!api || busy) return; setBusy(true);
    try {
      const data = await readExtension();
      const library = [...data.collection, ...data.activePets.filter(p => !data.collection.some(c => c.id === p.id))];
      const ids = data.activePets.map(p => p.id);
      const nextCollection = remove ? library.filter(p => p.id !== id) : library;
      const nextIds = remove || ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
      const nextPet = remove && data.pet.id === id ? nextCollection[0] ?? DEFAULT_PET : data.pet;
      await api.storage.local.set({ collection: nextCollection, activeIds: nextIds, pet: nextPet });
      setCollection(nextCollection); setActiveIds(nextIds); setPet(nextPet); setDeleting('');
      setMessage(remove ? 'ลบตัวละครแล้ว' : 'บันทึกแล้ว');
    } catch { setMessage('บันทึกไม่ได้ กรุณาลองใหม่'); } finally { setBusy(false); }
  }
  const hidden = preferences.hiddenSites.includes(hostname);
  return <div className="popup"><header><strong>MongBo<span>{tr("มองโบ๋")}</span></strong><span className="popup-tag">{tr("เพื่อนเงียบ ๆ ของคุณ")}</span></header><div className="popup-pet"><Pet pet={pet}/><h1>{pet.name}</h1><p>{tr("พร้อมอยู่เป็นเพื่อนแล้ว")}</p></div>
    <label className="toggle-row"><span><Icon name="heart" size={17}/>{tr("ให้น้องอยู่ด้วย")}</span><input type="checkbox" checked={preferences.enabled} disabled={!ready || busy} onChange={e => update({ ...preferences, enabled: e.target.checked })}/></label>
    <label className="toggle-row"><span><Icon name="pause" size={17}/>{tr("พักการเดิน")}</span><input type="checkbox" checked={preferences.paused} disabled={!ready || busy} onChange={e => update({ ...preferences, paused: e.target.checked })}/></label>
    {!desktop && <button className="site-toggle" disabled={!hostname || !ready || busy} onClick={() => update({ ...preferences, hiddenSites: hidden ? preferences.hiddenSites.filter(s => s !== hostname) : [...preferences.hiddenSites, hostname] })}><Icon name="globe" size={16}/>{hostname ? hidden ? tr("แสดงบน {0}", hostname) : tr("ซ่อนบน {0}", hostname) : tr("หน้านี้ไม่รองรับตัวละคร")}</button>}
    <button className="popup-primary" disabled={!ready} onClick={async () => { try { await api?.tabs.create({ url: api.runtime.getURL('index.html') }); } catch { setMessage('เปิดสตูดิโอไม่ได้ กรุณาลองใหม่'); } }}><Icon name="spark" size={18}/>{tr("เปิดสตูดิโอแต่งตัวละคร")}<Icon name="arrow" size={16}/></button>
    <button className="popup-import" disabled={!ready || busy} onClick={() => input.current?.click()}><Icon name="upload" size={16}/>{tr("นำเข้าตัวละครจากเว็บ")}</button><input ref={input} type="file" accept=".json,application/json" hidden onChange={importPet} aria-label={tr("นำเข้าตัวละคร")}/>
    <section className="popup-library" aria-label={tr(desktop ? 'เพื่อนบนเดสก์ท็อป' : 'เพื่อนในส่วนขยาย')}><h2>{tr(desktop ? 'เพื่อนบนเดสก์ท็อป' : 'เพื่อนในส่วนขยาย')} ({collection.length}/30)</h2><p>{tr('เปิดได้หลายตัวพร้อมกัน ปิดสวิตช์เพื่อซ่อนโดยไม่ลบ')}</p>{collection.length === 0 && <p>{tr('ยังไม่มีเพื่อน กดนำเข้าตัวละครเพื่อเพิ่ม')}</p>}{collection.map(friend => <article className="popup-friend" key={friend.id}><Pet pet={friend}/><span>{friend.name}</span><label><input type="checkbox" aria-label={tr('แสดง {0}', friend.name)} checked={activeIds.includes(friend.id)} disabled={!ready || busy} onChange={() => manage(friend.id)}/>{tr('แสดง')}</label><button disabled={busy} aria-label={tr('ลบ {0}', friend.name)} onClick={() => setDeleting(friend.id)}>{tr('ลบ')}</button>{deleting === friend.id && <div className="delete-confirm"><span>{tr(desktop ? 'ลบจากคลังเดสก์ท็อป?' : 'ลบจากคลังส่วนขยาย?')}</span><button disabled={busy} onClick={() => manage(friend.id, true)}>{tr('ยืนยันลบ')}</button><button onClick={() => setDeleting('')}>{tr('ยกเลิก')}</button></div>}</article>)}</section>
    <p className="popup-status" role="status">{tr(message) || tr("ลากน้องเพื่อย้าย คลิกขวาเพื่อเปิดเมนู")}</p><footer>{tr("เก็บในเครื่อง · ไม่มีระบบติดตาม")}</footer></div>;
}
setLanguage(savedLanguage()); applyDocumentLanguage();
createRoot(document.getElementById('root')!).render(<Popup/>);
