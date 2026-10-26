import { PetActor } from '../shared/actor.ts';
import { PET_CSS } from '../shared/art.ts';
import { extensionAPI, readExtension, writePreferences } from '../shared/browser.ts';
import { getLanguage, setLanguage, tr } from '../shared/locale.ts';

// Isolated content script: no page text, forms, browsing history, or network requests.
const api = extensionAPI();
if (api && window === window.top && !document.querySelector('[data-mongbo-overlay]')) {
  const host = document.createElement('div'); host.dataset.mongboOverlay = 'true';
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;pointer-events:none!important;z-index:2147483646!important;display:block!important;';
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style'); style.textContent = PET_CSS + `
    .stage{position:absolute;inset:0;pointer-events:none;overflow:hidden}
    .menu{position:absolute;background:#fcfaf8;color:#414145;border:1px solid #dedbe1;border-radius:13px;padding:7px;min-width:175px;max-height:calc(100vh - 16px);overflow:auto;box-shadow:0 5px 30px #34303a20;pointer-events:auto;font:12px/1.5 system-ui,sans-serif}
    .menu button{font:inherit;color:inherit;border:0;background:none;padding:9px 12px;display:block;text-align:left;width:100%;border-radius:7px;cursor:pointer}.menu button:hover,.menu button:focus-visible{background:#eeeaf1;outline:2px solid #a89bb8}
    .mb-pet{filter:drop-shadow(0 3px 3px #203e3710)}
  `; root.append(style);
  const stage = document.createElement('div'); stage.className = 'stage'; root.append(stage);
  let actor: PetActor | null = null, menu: HTMLDivElement | null = null, closed = false;
  let version = 0;
  function closeMenu() { menu?.remove(); menu = null; }
  async function showMenu(x: number, y: number) {
    closeMenu();
    try {
      const { preferences } = await readExtension();
      if (closed || !actor) return;
      menu = document.createElement('div'); menu.className = 'menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', tr('เมนูมองโบ๋'));
      menu.style.left = `${Math.max(0, Math.min(x, innerWidth - 200))}px`; menu.style.top = `${Math.max(0, Math.min(y, innerHeight - 250))}px`;
      const item = (label: string, action: () => void | Promise<void>) => { const button = document.createElement('button'); button.textContent = tr(label); button.setAttribute('role', 'menuitem'); button.onclick = async () => { try { await action(); closeMenu(); } catch { button.textContent = tr('ลองใหม่อีกครั้ง'); } }; menu!.append(button); };
      item(preferences.paused ? 'ให้น้องเดินต่อ' : 'พักการเดิน', () => writePreferences({ ...preferences, paused: !preferences.paused }));
      item('เรียกมาหา ♡', () => actor?.call());
      item('พูดสักหน่อย', () => actor?.speak());
      item('แต่งตัวละคร', async () => { await api!.runtime.sendMessage({ type: 'mongbo-open-studio' }); });
      item('ซ่อนบนเว็บนี้', () => writePreferences({ ...preferences, hiddenSites: [...new Set([...preferences.hiddenSites, location.hostname])] }));
      root.append(menu); menu.querySelector('button')?.focus();
    } catch { closeMenu(); }
  }
  async function refresh() {
    const current = ++version;
    try {
      const { pet, preferences, language } = await readExtension();
      if (closed || current !== version) return;
      if (getLanguage() !== language) closeMenu(); setLanguage(language);
      if (!preferences.enabled || preferences.hiddenSites.includes(location.hostname)) { actor?.destroy(); actor = null; closeMenu(); host.remove(); return; }
      if (!host.isConnected) document.documentElement.append(host);
      if (!actor) actor = new PetActor(stage, pet, { paused: preferences.paused, onMenu: showMenu });
      else { actor.update(pet); actor.setPaused(preferences.paused); }
    } catch { actor?.destroy(); actor = null; host.remove(); }
  }
  const changed = (_: Record<string, unknown>, area: string) => { if (area === 'local') void refresh(); };
  api.storage.onChanged.addListener(changed);
  document.addEventListener('pointerdown', e => { if (e.target !== host) closeMenu(); });
  root.addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Escape') { closeMenu(); actor?.element.focus(); } });
  window.addEventListener('pagehide', e => { if (!e.persisted) { closed = true; actor?.destroy(); api.storage.onChanged.removeListener(changed); } });
  void refresh();
}
