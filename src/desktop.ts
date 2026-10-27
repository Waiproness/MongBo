import { desktopBridge } from './desktop-api.ts';
import { readExtension } from './shared/browser.ts';
import { PetActor } from './shared/actor.ts';
import { PET_CSS } from './shared/art.ts';
import { setLanguage } from './shared/locale.ts';

const bridge = desktopBridge();
if (!bridge) throw new Error('Open MongBo Desktop to use this page');
const stage = document.getElementById('desktop-stage')!;
const style = document.createElement('style');
style.textContent = PET_CSS + 'html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#desktop-stage{position:fixed;inset:0;pointer-events:none}.mb-pet{pointer-events:auto}';
document.head.append(style);
const actors = new Map<string, PetActor>();
let revision = 0;
async function refresh() {
  const current = ++revision;
  try {
    const { activePets, preferences, language } = await readExtension();
    if (current !== revision) return;
    setLanguage(language);
    const visible = preferences.enabled ? activePets : [];
    const ids = new Set(visible.map(pet => pet.id));
    for (const [id, actor] of actors) if (!ids.has(id)) { actor.destroy(); actors.delete(id); }
    for (const [index, pet] of visible.entries()) {
      const actor = actors.get(pet.id);
      if (actor) { actor.update(pet); actor.setPaused(preferences.paused); }
      else actors.set(pet.id, new PetActor(stage, pet, { paused: preferences.paused, startFraction: (index + 1) / (visible.length + 1), onMenu: () => { void bridge!.menu(pet.id); } }));
    }
  } catch (error) { console.error('Unable to load desktop companions', error); }
}
bridge.api.storage.onChanged.addListener(() => { void refresh(); });
bridge.onSpeak(id => actors.get(id)?.speak());
stage.addEventListener('pointerdown', event => { if (event.button === 0 && (event.target as Element).closest('.mb-pet')) bridge.dragging(true); });
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) stage.addEventListener(event, () => bridge.dragging(false));
const hitTimer = setInterval(() => {
  bridge.regions([...actors.values()].map(actor => {
    const rect = actor.element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }));
}, 60);
window.addEventListener('pagehide', () => { clearInterval(hitTimer); bridge.dragging(false); actors.forEach(actor => actor.destroy()); });
void refresh();
