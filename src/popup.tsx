import { tr, applyDocumentLanguage, savedLanguage, setLanguage } from './shared/locale.ts';
import { useLanguage } from './shared/useLanguage.ts';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Pet } from './components/Pet.tsx';
import { Icon } from './components/Icon.tsx';
import { DEFAULT_PET, DEFAULT_PREFS, MAX_PET_FILE_BYTES, parseFile, upsertPet, type Preferences } from './shared/model.ts';
import { extensionAPI, readExtension, writePreferences } from './shared/browser.ts';
import './popup.css';
function Popup() {
  useLanguage();
  const [pet, setPet] = useState(DEFAULT_PET), [preferences, setPreferences] = useState(DEFAULT_PREFS), [hostname, setHostname] = useState('');
  const [message, setMessage] = useState(''), [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null), api = extensionAPI();
  useEffect(() => { if (!api) { setMessage('เปิดหน้านี้จากไอคอนส่วนขยาย MongBo'); return; }
    Promise.all([readExtension(), api.tabs.query({ active: true, currentWindow: true })]).then(([data, tabs]) => {
      setLanguage(data.language); setPet(data.pet); setPreferences(data.preferences);
      try { const url = new URL(tabs[0]?.url || ''); if (['http:', 'https:'].includes(url.protocol)) setHostname(url.hostname); } catch { /* Browser-owned tabs have no usable hostname. */ }
      setReady(true);
    }).catch(() => setMessage('โหลดข้อมูลไม่ได้ ปิดแล้วเปิดส่วนขยายอีกครั้ง'));
  }, []);
  async function update(next: Preferences) { setBusy(true); try { await writePreferences(next); setPreferences(next); setMessage('บันทึกแล้ว'); } catch { setMessage('บันทึกไม่ได้ กรุณาลองใหม่'); } finally { setBusy(false); } }
  async function importPet(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file || !api) return;
    setBusy(true);
    try { if (file.size > MAX_PET_FILE_BYTES) throw new Error('ไฟล์ต้องไม่เกิน 32 KB'); const imported = parseFile(await file.text()); const data = await readExtension(); await api.storage.local.set({ pet: imported, collection: upsertPet(data.collection, imported) }); setPet(imported); setMessage('น้องพร้อมไปด้วยแล้ว ♡'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'นำเข้าไม่ได้'); } finally { setBusy(false); }
  }
  const hidden = preferences.hiddenSites.includes(hostname);
  return <div className="popup"><header><strong>MongBo<span>{tr("มองโบ๋")}</span></strong><span className="popup-tag">{tr("เพื่อนเงียบ ๆ ของคุณ")}</span></header><div className="popup-pet"><Pet pet={pet}/><h1>{pet.name}</h1><p>{tr("พร้อมอยู่เป็นเพื่อนแล้ว")}</p></div>
    <label className="toggle-row"><span><Icon name="heart" size={17}/>{tr("ให้น้องอยู่ด้วย")}</span><input type="checkbox" checked={preferences.enabled} disabled={!ready || busy} onChange={e => update({ ...preferences, enabled: e.target.checked })}/></label>
    <label className="toggle-row"><span><Icon name="pause" size={17}/>{tr("พักการเดิน")}</span><input type="checkbox" checked={preferences.paused} disabled={!ready || busy} onChange={e => update({ ...preferences, paused: e.target.checked })}/></label>
    <button className="site-toggle" disabled={!hostname || !ready || busy} onClick={() => update({ ...preferences, hiddenSites: hidden ? preferences.hiddenSites.filter(s => s !== hostname) : [...preferences.hiddenSites, hostname] })}><Icon name="globe" size={16}/>{hostname ? hidden ? tr("แสดงบน {0}", hostname) : tr("ซ่อนบน {0}", hostname) : tr("หน้านี้ไม่รองรับตัวละคร")}</button>
    <button className="popup-primary" disabled={!ready} onClick={async () => { try { await api?.tabs.create({ url: api.runtime.getURL('index.html') }); } catch { setMessage('เปิดสตูดิโอไม่ได้ กรุณาลองใหม่'); } }}><Icon name="spark" size={18}/>{tr("เปิดสตูดิโอแต่งตัวละคร")}<Icon name="arrow" size={16}/></button>
    <button className="popup-import" disabled={!ready || busy} onClick={() => input.current?.click()}><Icon name="upload" size={16}/>{tr("นำเข้าตัวละครจากเว็บ")}</button><input ref={input} type="file" accept=".json,application/json" hidden onChange={importPet} aria-label={tr("นำเข้าตัวละคร")}/>
    <p className="popup-status" role="status">{tr(message) || tr("ลากน้องเพื่อย้าย คลิกขวาเพื่อเปิดเมนู")}</p><footer>{tr("เก็บในเครื่อง · ไม่มีระบบติดตาม")}</footer></div>;
}
setLanguage(savedLanguage()); applyDocumentLanguage();
createRoot(document.getElementById('root')!).render(<Popup/>);
