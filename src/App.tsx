import { tr, setLanguage } from './shared/locale.ts';
import { useLanguage } from './shared/useLanguage.ts';
import { LanguagePicker } from './components/LanguagePicker.tsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ACCESSORIES, COLORS, DEFAULT_PET, EYEWEAR, FACES, LABELS, MAX_PET_FILE_BYTES, OUTFITS, SPECIES, parseFile, parsePet, serializePet, upsertPet, type Pet as PetData } from './shared/model.ts';
import { download, extensionAPI, readExtension, safeCollection } from './shared/browser.ts';
import { petSVG } from './shared/art.ts';
import { Icon } from './components/Icon.tsx';
import { Pet } from './components/Pet.tsx';
import { Room } from './components/Room.tsx';
import { AppearanceEditor } from './components/AppearanceEditor.tsx';
import { WardrobeEditor } from './components/WardrobeEditor.tsx';
import { DrawingEditor } from './components/DrawingEditor.tsx';
import { SpeechEditor } from './components/SpeechEditor.tsx';
import { ThemePicker } from './components/ThemePicker.tsx';
import { BrowserSetup } from './components/BrowserSetup.tsx';
import { SiteColorPicker } from './components/SiteColorPicker.tsx';

function readLocal(key: string): unknown { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
function initialPet() { try { return parsePet(readLocal('mongbo.draft')); } catch { return DEFAULT_PET; } }
function Modal({ title, close, children, wide = false }: { title: string; close(): void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const opener = document.activeElement as HTMLElement | null; ref.current?.showModal(); return () => { opener?.focus(); }; }, []);
  return <dialog className={wide ? "modal drawing-modal" : "modal"} ref={ref} onCancel={close} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }}><div className="modal-heading"><h2>{title}</h2><button className="round-button" onClick={close} aria-label={tr("ปิดหน้าต่าง")}><Icon name="close"/></button></div>{children}</dialog>;
}
export function App() {
  useLanguage();
  const [pet, setPet] = useState<PetData>(initialPet), [collection, setCollection] = useState<PetData[]>(() => safeCollection(readLocal('mongbo.collection')));
  const [tab, setTab] = useState('studio'), [section, setSection] = useState('look'), [paused, setPaused] = useState(false);
  const [modal, setModal] = useState<'setup' | 'about' | 'draw' | null>(null), [notice, setNotice] = useState(''), [ready, setReady] = useState(!extensionAPI());
  const [speechPreview, setSpeechPreview] = useState<{ text: string; id: number }>();
  const [savedId, setSavedId] = useState(''), [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null), noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const api = extensionAPI();
  function tell(message: string) { clearTimeout(noticeTimer.current); setNotice(message); noticeTimer.current = setTimeout(() => setNotice(''), 4200); }
  useEffect(() => { if (!api) return; readExtension().then(data => { setLanguage(data.language); setPet(data.pet); setCollection(data.collection); setReady(true); }).catch(() => { setReady(true); tell('โหลดข้อมูลส่วนขยายไม่ได้ ลองปิดแล้วเปิดหน้านี้ใหม่'); }); }, []);
  useEffect(() => { if (!ready || api) return; try { localStorage.setItem('mongbo.draft', JSON.stringify(pet)); } catch { tell('พื้นที่เก็บข้อมูลไม่พร้อม ส่งออกไฟล์เพื่อเก็บตัวละครไว้'); } }, [pet, ready]);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  function change<K extends keyof PetData>(key: K, value: PetData[K]) { setPet(p => ({ ...p, [key]: value })); setSavedId(''); }
  async function save(use = false) {
    if (busy || !ready) return;
    try {
      setBusy(true); const validated = parsePet(pet), next = upsertPet(collection, validated);
      if (api) { const data = await readExtension(); await api.storage.local.set({ pet: validated, collection: next, ...(use ? { activeIds: [...new Set([...data.activePets.map(p => p.id), validated.id])] } : {}) }); }
      else localStorage.setItem('mongbo.collection', JSON.stringify(next));
      setCollection(next); setPet(validated); setSavedId(validated.id);
      if (use && !api) setModal('setup');
      tell(use && api ? 'น้องพร้อมไปเป็นเพื่อนแล้ว เปิดเว็บอื่นได้เลย' : 'เก็บเพื่อนตัวนี้ไว้แล้ว ♡');
    } catch (e) { tell(e instanceof Error ? e.message : 'บันทึกไม่ได้ กรุณาส่งออกไฟล์เก็บไว้'); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    try {
      const next = collection.filter(p => p.id !== id);
      if (api) await api.storage.local.set({ collection: next }); else localStorage.setItem('mongbo.collection', JSON.stringify(next));
      setCollection(next); tell('นำออกจากคลังแล้ว ตัวที่กำลังแต่งยังอยู่');
    } catch { tell('แก้ไขคลังไม่ได้ กรุณาลองใหม่'); }
  }
  function exportPet() { try { download(serializePet(pet), `${pet.id}.mongbo.json`); tell('ส่งออกไฟล์ตัวละครแล้ว'); } catch (e) { tell((e as Error).message); } }
  async function importPet(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; event.target.value = ''; if (!selected) return;
    try { if (selected.size > MAX_PET_FILE_BYTES) throw new Error('ไฟล์ตัวละครต้องไม่เกิน 32 KB'); const p = parseFile(await selected.text()); setPet(p); setSavedId(''); setTab('studio'); tell('นำเข้าแล้ว กดเก็บเพื่อนตัวนี้เพื่อบันทึก'); } catch (e) { tell((e as Error).message); }
  }
  function randomize() { const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]; setPet(p => ({ ...p, species: pick(SPECIES), color: pick(COLORS), face: pick(FACES), accessory: pick(ACCESSORIES), outfit: pick(OUTFITS), eyewear: pick(EYEWEAR) })); setSavedId(''); }
  async function portrait() {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([petSVG(pet)], { type: 'image/svg+xml' })); const img = new Image(); img.src = url; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 720; canvas.getContext('2d')!.drawImage(img, 0, 0, 720, 720);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error();
      download(blob, `${pet.id}.png`, 'image/png'); tell('ดาวน์โหลดรูปพื้นหลังโปร่งใสแล้ว');
    } catch { tell('ดาวน์โหลดรูปไม่ได้ ลองส่งออกไฟล์ตัวละครแทน'); } finally { if (url) URL.revokeObjectURL(url); }
  }
  return <>
    <header className="site-header"><a className="brand" href="./" aria-label={tr("MongBo หน้าหลัก")}><Pet pet={{ ...DEFAULT_PET, accessory: 'none' }}/><strong>MongBo<span>{tr("มองโบ๋")}</span></strong></a>
      <nav aria-label={tr("เมนูหลัก")}><button className={tab === 'studio' ? 'nav-link active' : 'nav-link'} onClick={() => setTab('studio')}><Icon name="spark" size={17}/>{tr("สร้างเพื่อน")}</button><button className={tab === 'collection' ? 'nav-link active' : 'nav-link'} onClick={() => setTab('collection')}><Icon name="grid" size={17}/>{tr("เพื่อนของฉัน")}{collection.length > 0 && <span className="count">{collection.length}</span>}</button></nav>
      <div className="header-actions"><LanguagePicker/><SiteColorPicker/><ThemePicker/><button className="header-button" onClick={() => setModal('setup')}><Icon name="globe" size={17}/><span>{tr("พาไปท่องเว็บ")}</span><Icon name="arrow" size={16}/></button></div>
    </header>
    <main>
      <div className="intro"><div><div className="intro-note"><span/> a little company, a lot of comfort</div><h1>{tab === 'studio' ? tr("เพื่อนตัวเล็ก ในโลกของคุณ") : tr("ทุกตัว มีที่พักตรงนี้")}</h1><p>{tab === 'studio' ? tr("สร้างมองโบ๋ในแบบคุณ แล้วให้วันธรรมดามีเพื่อนอยู่ข้าง ๆ") : tr("เพื่อนที่คุณสร้างไว้ พร้อมกลับไปท่องเว็บด้วยกันเสมอ")}</p></div><div className="intro-sticker"><Icon name="leaf" size={19}/><span>{tr("อยู่เป็นเพื่อน")}<br/><b>{tr("ไม่ต้องชวนคุยก็ได้")}</b></span></div></div>
      {tab === 'studio' ? <div className="studio-layout"><section className="preview-column" aria-label={tr("ตัวอย่างตัวละคร")}><Room pet={pet.name.trim() ? pet : { ...pet, name: tr("เพื่อนคนใหม่") }} paused={paused} onPause={() => setPaused(p => !p)} speechPreview={speechPreview}/>
        <div className="companion-card"><div className="companion-copy"><span className="tiny-avatar"><Pet pet={pet.name.trim() ? pet : { ...pet, name: tr("เพื่อนคนใหม่") }}/></span><div><h2>{pet.name || tr("เพื่อนคนใหม่")}<span>{tr("เพื่อนของคุณ")}</span></h2><p>{pet.energy < 30 ? tr("ชอบนั่งเงียบ ๆ ข้างคุณ") : pet.energy > 70 ? tr("ตัวเล็ก แต่พลังงานเต็มเปี่ยม") : tr("เดินเล่นบ้าง พักบ้าง อยู่ด้วยกันได้ทั้งวัน")}</p></div></div><button className="round-button" onClick={portrait} title={tr("ดาวน์โหลดรูป PNG")} aria-label={tr("ดาวน์โหลดรูป PNG")}><Icon name="image"/></button></div>
        <div className="quiet-promise"><Icon name="moon" size={20}/><p><b>{tr("เพื่อนที่ไม่เรียกร้องอะไร")}</b><span>{tr("ไม่มีภารกิจ ไม่มีแจ้งเตือน แค่อยู่ตรงนี้เวลาคุณอยากมีใคร")}</span></p><span className="promise-doodle">♡</span></div>
      </section><aside className="editor" aria-label={tr("แต่งตัวละคร")}><div className="editor-heading"><div><h2>{tr("ให้เพื่อนเป็นแบบคุณ")}</h2><p>{tr("นิดนี้หน่อยนั้น ก็เป็นตัวเองแล้ว")}</p></div><button className="round-button" onClick={randomize} title={tr("สุ่มหน้าตา")} aria-label={tr("สุ่มหน้าตา")}><Icon name="shuffle" size={19}/></button></div>
        <div className="editor-tabs" role="tablist" aria-label={tr("หมวดการแต่ง")}><button role="tab" aria-selected={section === 'look'} aria-controls="look-panel" id="look-tab" onClick={() => setSection('look')}><Icon name="spark" size={16}/>{tr("หน้าตา")}</button><button role="tab" aria-selected={section === 'wardrobe'} aria-controls="wardrobe-panel" id="wardrobe-tab" onClick={() => setSection('wardrobe')}><Icon name="heart" size={16}/>{tr("ชุดและของ")}</button><button role="tab" aria-selected={section === 'speech'} aria-controls="speech-panel" id="speech-tab" onClick={() => setSection('speech')}><Icon name="message" size={16}/>{tr("คำพูด")}</button><button role="tab" aria-selected={section === 'vibe'} aria-controls="vibe-panel" id="vibe-tab" onClick={() => setSection('vibe')}><Icon name="settings" size={16}/>{tr("นิสัยและชื่อ")}</button></div>
        {section === 'look' ? <AppearanceEditor pet={pet} onChange={change} draw={() => setModal('draw')}/> : section === 'wardrobe' ? <WardrobeEditor pet={pet} onChange={change}/> : section === 'speech' ? <SpeechEditor value={pet.speech} onChange={speech => change('speech', speech)} preview={text => setSpeechPreview(previous => ({ text, id: (previous?.id ?? 0) + 1 }))}/> : <div className="editor-body vibe-panel" role="tabpanel" aria-labelledby="vibe-tab" id="vibe-panel"><label className="field-label" htmlFor="pet-name">{tr("อยากเรียกน้องว่าอะไร")}</label><input id="pet-name" value={pet.name} maxLength={24} onChange={e => change('name', e.target.value)} placeholder={tr("ชื่อเพื่อนคนใหม่")}/><p className="field-help">{tr("ชื่อสั้น ๆ ที่เรียกแล้วรู้สึกดี · ไม่เกิน 24 ตัวอักษร")}</p><label className="field-label" htmlFor="pet-size">{tr("ตัวเล็กหรือตัวโต")}<span>{pet.size} px</span></label><input id="pet-size" type="range" min="64" max="160" value={pet.size} onChange={e => change('size', Number(e.target.value))}/><div className="range-labels"><span>{tr("จิ๋วพอดีมุม")}</span><span>{tr("กอดเต็มมือ")}</span></div><label className="field-label" htmlFor="pet-energy">{tr("ความซน")}<span>{pet.energy}%</span></label><input id="pet-energy" type="range" min="0" max="100" value={pet.energy} onChange={e => change('energy', Number(e.target.value))}/><div className="range-labels"><span>{tr("นั่งเป็นเพื่อน")}</span><span>{tr("ขอวิ่งเล่นหน่อย")}</span></div><div className="vibe-note"><Icon name="heart"/><p>{tr("น้องไม่เหงาถ้าคุณยุ่ง")}<br/>{tr("กลับมาเล่นด้วยเมื่อพร้อมก็พอ")}</p></div></div>}
        <div className="editor-bottom"><button className="primary-button" onClick={() => save()} disabled={busy || !ready}><Icon name={savedId === pet.id ? 'check' : 'heart'} size={19}/>{savedId === pet.id ? tr("เก็บไว้แล้ว") : tr("เก็บเพื่อนตัวนี้")}</button><div className="editor-tools"><button onClick={exportPet}><Icon name="download" size={15}/>{tr("ส่งออก")}</button><span/><button onClick={() => file.current?.click()}><Icon name="upload" size={15}/>{tr("นำเข้า")}</button></div></div>
      </aside></div> : <section className="collection"><div className="collection-top"><h2>{tr("คลังเพื่อน ")}<span>{collection.length}/30</span></h2><div><button className="small-button" onClick={() => file.current?.click()}><Icon name="upload" size={16}/>{tr("นำเข้า")}</button><button className="primary-button" onClick={() => { setPet({ ...DEFAULT_PET, id: crypto.randomUUID(), name: tr("เพื่อนคนใหม่") }); setSavedId(''); setTab('studio'); }}><Icon name="plus" size={17}/>{tr("สร้างเพื่อนใหม่")}</button></div></div>{collection.length ? <div className="collection-grid">{collection.map(p => <article className="saved-pet" key={p.id}><div className="saved-art" style={{ background: `${p.color}28` }}><Pet pet={p}/></div><h3>{p.name}</h3><p>{tr(LABELS[p.species])} · {tr(LABELS[p.face])}</p><div><button className="small-button" onClick={() => { setPet(p); setSavedId(p.id); setTab('studio'); }}>{tr("แต่งต่อ")}<Icon name="arrow" size={15}/></button><button className="round-button" aria-label={tr("นำ {0} ออกจากคลัง", p.name)} onClick={() => remove(p.id)}><Icon name="trash" size={16}/></button></div></article>)}</div> : <div className="empty-state"><Pet pet={DEFAULT_PET}/><h3>{tr("เพื่อนคนแรก กำลังรอคุณอยู่")}</h3><p>{tr("ลองสร้างตัวละคร แล้วกด “เก็บเพื่อนตัวนี้”")}</p><button className="primary-button" onClick={() => setTab('studio')}>{tr("ไปสร้างเพื่อน")}<Icon name="arrow" size={17}/></button></div>}</section>}
      <section className="take-along"><div className="take-icon"><Icon name="globe" size={25}/></div><div><h2>{tr("ไม่ว่าคุณจะเปิดแท็บไหน ก็มีเพื่อนไปด้วย")}</h2><p>{tr("พามองโบ๋ไปเดินเล่นบน Brave, Edge และ Opera")}</p></div><button className="dark-button" onClick={() => save(true)} disabled={busy || !ready}>{tr("พาน้องไปด้วย")}<Icon name="arrow" size={18}/></button></section>
    </main><footer><span className="footer-brand">MongBo <span>small friend, soft days.</span></span><span className="footer-owner">{tr("สร้างและดูแลโดย ")}<strong>WaiTy</strong><a className="footer-github" href="https://github.com/Waiproness" target="_blank" rel="noopener noreferrer" aria-label={tr("GitHub ของ WaiTy (เปิดแท็บใหม่)")}>GitHub ↗</a></span><button className="story-secret" title={tr("ชื่อมองโบ๋มาจากไหน?")} onClick={() => setModal('about')}>{tr("ความลับของชื่อ")}<Icon name="heart" size={13}/></button></footer>
    <input ref={file} type="file" accept=".json,.mongbo.json,application/json" hidden onChange={importPet} aria-label={tr("ไฟล์ตัวละคร")}/>
    <div className={notice ? 'toast visible' : 'toast'} role="status" aria-live="polite">{notice && <><Icon name="leaf" size={18}/>{tr(notice)}</>}</div>
    {modal === 'setup' && <Modal title={tr("พามองโบ๋ไปท่องเว็บ")} close={() => setModal(null)}><p className="modal-intro">{tr("เว็บสร้างเพื่อน ส่วนขยายพาเพื่อนไปอยู่ข้าง ๆ บนแท็บอื่น")}</p>{api ? <div className="setup-success"><Icon name="check"/><p>{tr("คุณอยู่ในสตูดิโอของส่วนขยายแล้ว")}<br/>{tr("กด “พาน้องไปด้วย” แล้วเปิดเว็บไซต์อื่นได้เลย")}</p></div> : <ol className="setup-steps"><li><strong>{tr("ติดตั้งส่วนขยาย MongBo ครั้งแรกด้วย ZIP")}</strong><BrowserSetup/></li><li><strong>{tr("ส่งเพื่อนตัวนี้ไปด้วย")}</strong><p>{tr("ส่งออก JSON แล้วเปิดไอคอน MongBo เลือก “นำเข้าตัวละครจากเว็บ” ตัวใหม่จะเพิ่มเข้าคลังและเดินพร้อมตัวเดิม ไม่ต้องติดตั้งส่วนขยายใหม่")}</p><button className="small-button" onClick={exportPet}><Icon name="download" size={16}/>{tr("ส่งออกตัวละครนี้")}</button></li><li><strong>{tr("เปิดเว็บ แล้วไปด้วยกัน")}</strong><p>{tr("รีเฟรชแท็บหลังติดตั้งครั้งแรก ใน popup เปิดหรือปิดสวิตช์เพื่อนแต่ละตัวเพื่อแสดงหรือซ่อน กดลบและยืนยันเพื่อนำออกจากคลัง")}</p></li></ol>}<div className="privacy-note"><Icon name="leaf" size={19}/><p>{tr("เก็บตัวละครในเครื่อง ไม่มีบัญชีหรือระบบติดตาม")}<br/>{tr("ส่วนขยายแสดงตัวละครบนเว็บทั่วไป ไม่รองรับหน้าภายในเบราว์เซอร์และหน้าที่จำกัดสิทธิ์")}</p></div></Modal>}
    {modal === 'draw' && <Modal title={tr("วาดเพื่อนของคุณ")} close={() => setModal(null)} wide><DrawingEditor initial={pet.drawing} apply={drawing => { setPet(p => ({ ...p, id: p.species === 'custom' ? p.id : crypto.randomUUID(), species: 'custom', drawing, accessory: p.species === 'custom' ? p.accessory : 'none', outfit: p.species === 'custom' ? p.outfit : 'none', eyewear: p.species === 'custom' ? p.eyewear : 'none' })); setSavedId(''); setModal(null); setSection('look'); tell('เพื่อนที่คุณวาดพร้อมเดินแล้ว กดเก็บเพื่อนตัวนี้เพื่อบันทึก'); }}/></Modal>}
    {modal === 'about' && <Modal title={tr("เรื่องเล็ก ๆ ของมองโบ๋")} close={() => setModal(null)}><div className="about-pet"><Pet pet={DEFAULT_PET}/></div><div className="story-copy"><p>{tr("ผมเป็นคน introvert ที่ชอบอยู่กับคอมพิวเตอร์นาน ๆ เลยอยากมีเพื่อนตัวเล็ก ๆ อยู่ข้างหน้าจอ ระหว่างทำงาน เขียนโค้ด หรือท่องเว็บ")}</p><p>{tr("ชื่อ ")}<strong>{tr("MongBo — มองโบ๋")}</strong>{tr(" มาจากสุนัขของผมที่ชื่อ ")}<strong>{tr("“โบ้” หรือ “โบ๋”")}</strong>{tr(" ซึ่งปัจจุบันได้จากไปแล้ว")}</p><p>{tr("มองโบ๋จึงมีทั้งความตั้งใจที่จะเป็นเพื่อนเงียบ ๆ ให้คนที่อยากมีใครอยู่ด้วย และความทรงจำเล็ก ๆ ถึงเขาอยู่ในชื่อนี้")}</p></div><p className="story-dedication">{tr("แด่โบ้ / โบ๋ เพื่อนที่อยู่ในความทรงจำเสมอ ♡")}</p><p className="story-signature">WaiTy<span>{tr("ผู้สร้าง MongBo")}</span></p></Modal>}

  </>;
}
