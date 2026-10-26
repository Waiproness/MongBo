export const SPECIES = ['blob', 'cat', 'bunny', 'bot', 'bear', 'fox', 'frog', 'panda', 'chick', 'penguin', 'ghost', 'axolotl', 'mushroom', 'dragon', 'puppy', 'octopus'] as const;
export const FACES = ['happy', 'sleepy', 'curious', 'shy', 'calm', 'excited', 'love', 'wink', 'laughing', 'proud', 'focused', 'bored', 'sad', 'crying', 'worried', 'scared', 'angry', 'surprised', 'confused', 'dizzy'] as const;
export const ACCESSORIES = ['none', 'sprout', 'headphones', 'bow', 'star', 'cap', 'beanie', 'crown', 'wizard', 'flower', 'halo', 'pirate', 'beret', 'horns', 'antenna', 'party', 'chef', 'straw', 'tiara', 'leaf'] as const;
export const OUTFITS = ['none', 'tee', 'hoodie', 'sweater', 'overalls', 'suit', 'scarf', 'raincoat', 'space', 'kimono', 'armor', 'labcoat', 'sailor', 'jersey', 'pajamas', 'cape'] as const;
export const EYEWEAR = ['none', 'round', 'square', 'sun', 'heart', 'monocle', 'visor'] as const;
export const COLORS = ['#b9a3e3', '#c9b8a8', '#e8b19d', '#e6c66e', '#8dbed6', '#d6a9c7', '#b9c2ca', '#f1ede2'] as const;
export type Drawing = { size: 32; pixels: string[] };
export type WearLayer = 'outfit' | 'accessory' | 'eyewear';
export type WearAdjustment = { x: number; y: number; scaleX: number; scaleY: number };
export type WearFit = Partial<Record<WearLayer, WearAdjustment>>;
export const DEFAULT_FIT: WearAdjustment = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
export type Speech = { messages: string[]; auto: boolean; interval: number };
export const DEFAULT_SPEECH: Speech = { messages: ['อยู่ตรงนี้เป็นเพื่อนนะ ♡'], auto: false, interval: 45 };
export const MAX_PET_FILE_BYTES = 32768;
export type Pet = { version: 1; id: string; name: string; species: typeof SPECIES[number] | 'custom'; color: string; face: typeof FACES[number]; accessory: typeof ACCESSORIES[number]; outfit: typeof OUTFITS[number]; outfitColor: string; accessoryColor: string; eyewear: typeof EYEWEAR[number]; size: number; energy: number; drawing?: Drawing; fit?: WearFit; speech?: Speech };
export type Preferences = { enabled: boolean; paused: boolean; hiddenSites: string[] };
export const DEFAULT_PREFS: Preferences = { enabled: true, paused: false, hiddenSites: [] };
export const DEFAULT_PET: Pet = { version: 1, id: 'mongbo-first', name: 'มองโบ๋', species: 'blob', color: COLORS[0], face: 'happy', accessory: 'sprout', outfit: 'none', outfitColor: '#769bb0', accessoryColor: '#a18ac2', eyewear: 'none', size: 104, energy: 45 };
export const LABELS = { blob: 'เจ้าโมจิ', cat: 'เจ้าเหมียว', bunny: 'เจ้ากระต่าย', bot: 'เจ้าบอท', bear: 'เจ้าหมี', fox: 'เจ้าจิ้งจอก', frog: 'เจ้ากบ', panda: 'เจ้าแพนด้า', chick: 'เจ้าลูกเจี๊ยบ', penguin: 'เจ้าเพนกวิน', ghost: 'เจ้าผีน้อย', axolotl: 'เจ้าแอกโซลอเติล', mushroom: 'เจ้าเห็ด', dragon: 'เจ้ามังกร', puppy: 'เจ้าตูบ', octopus: 'เจ้าหมึก', custom: 'วาดเอง', happy: 'ยิ้มแฉ่ง', sleepy: 'ง่วงนิด ๆ', curious: 'อยากรู้อยากเห็น', shy: 'ขี้อาย', calm: 'สบายใจ', excited: 'ตื่นเต้น', love: 'ตกหลุมรัก', wink: 'ขยิบตา', laughing: 'หัวเราะ', proud: 'ภูมิใจ', focused: 'ตั้งใจทำงาน', bored: 'เบื่อจัง', sad: 'เศร้านิด ๆ', crying: 'ร้องไห้', worried: 'กังวล', scared: 'ตกใจกลัว', angry: 'งอนแล้ว', surprised: 'เซอร์ไพรส์', confused: 'งงนิดหน่อย', dizzy: 'มึนตึ้บ', none: 'ไม่ใส่', sprout: 'ต้นอ่อน', headphones: 'หูฟัง', bow: 'โบว์', star: 'ดาวน้อย', cap: 'หมวกแก๊ป', beanie: 'หมวกไหมพรม', crown: 'มงกุฎ', wizard: 'หมวกพ่อมด', flower: 'ดอกไม้', halo: 'วงแหวน', pirate: 'โจรสลัด', beret: 'หมวกเบเรต์', horns: 'เขาน้อย', antenna: 'เสาอวกาศ', party: 'หมวกปาร์ตี้', chef: 'หมวกเชฟ', straw: 'หมวกฟาง', tiara: 'เทียร่า', leaf: 'ใบไม้', tee: 'เสื้อยืด', hoodie: 'ฮู้ดดี้', sweater: 'เสื้อไหมพรม', overalls: 'เอี๊ยม', suit: 'สูท', scarf: 'ผ้าพันคอ', raincoat: 'เสื้อกันฝน', space: 'ชุดอวกาศ', kimono: 'กิโมโน', armor: 'ชุดอัศวิน', labcoat: 'เสื้อกาวน์', sailor: 'ชุดกะลาสี', jersey: 'เสื้อกีฬา', pajamas: 'ชุดนอน', cape: 'ผ้าคลุม', round: 'แว่นกลม', square: 'แว่นเหลี่ยม', sun: 'แว่นกันแดด', heart: 'แว่นหัวใจ', monocle: 'แว่นข้างเดียว', visor: 'แว่นไซไฟ' };
export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) return '#' + [...hex].map(c => c + c).join('').toLowerCase();
  return /^[0-9a-f]{6}$/i.test(hex) ? '#' + hex.toLowerCase() : null;
}
function isColor(value: unknown): value is string { return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value); }
export function parseDrawing(value: unknown, allowEmpty = false): Drawing {
  if (!value || typeof value !== 'object') throw new Error('ข้อมูลภาพวาดไม่ถูกต้อง');
  const d = value as Record<string, unknown>;
  if (d.size !== 32 || !Array.isArray(d.pixels) || d.pixels.length !== 1024 || !d.pixels.every(v => v === '' || isColor(v))) throw new Error('ภาพวาดต้องมีขนาด 32 × 32 และใช้สี HEX เท่านั้น');
  if (!allowEmpty && !d.pixels.some(Boolean)) throw new Error('วาดเพื่อนลงบนกระดานก่อนนะ');
  return { size: 32, pixels: [...d.pixels] };
}
function parseFit(value: unknown): WearFit | undefined {
  if (value === undefined) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ข้อมูลตำแหน่งชุดไม่ถูกต้อง');
  const fit: WearFit = {};
  for (const layer of ['outfit', 'accessory', 'eyewear'] as const) {
    const raw = (value as Record<string, unknown>)[layer]; if (raw === undefined) continue;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('ข้อมูลตำแหน่งชุดไม่ถูกต้อง');
    const a = raw as Record<string, unknown>;
    for (const key of ['x', 'y', 'scaleX', 'scaleY'] as const) {
      const n = a[key], scale = key === 'scaleX' || key === 'scaleY';
      if (typeof n !== 'number' || !Number.isFinite(n) || (scale ? n < .5 || n > 1.8 : n < -40 || n > 40)) throw new Error('ตำแหน่งหรือขนาดชุดอยู่นอกช่วง');
    }
    fit[layer] = { x: a.x as number, y: a.y as number, scaleX: a.scaleX as number, scaleY: a.scaleY as number };
  }
  return Object.keys(fit).length ? fit : undefined;
}
export function parseSpeech(value: unknown): Speech {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ข้อมูลคำพูดไม่ถูกต้อง');
  const s = value as Record<string, unknown>;
  if (!Array.isArray(s.messages) || s.messages.length > 20 || typeof s.auto !== 'boolean' || typeof s.interval !== 'number' || !Number.isInteger(s.interval) || s.interval < 15 || s.interval > 180) throw new Error('เก็บได้ 20 ข้อความ และตั้งเวลาพูดได้ 15–180 วินาที');
  const messages = s.messages.map(value => {
    if (typeof value !== 'string') throw new Error('คำพูดต้องเป็นข้อความ');
    const text = value.replace(/\r\n?/g, '\n').trim();
    if (!text || [...text].length > 120 || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(text)) throw new Error('แต่ละข้อความต้องยาว 1–120 ตัวอักษร');
    return text;
  });
  return { messages, auto: s.auto, interval: s.interval };
}
export function parsePet(value: unknown): Pet {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ไฟล์นี้ไม่มีข้อมูลตัวละคร');
  const p = value as Record<string, unknown>;
  if (p.version !== 1 || typeof p.name !== 'string' || !p.name.trim() || [...p.name.trim()].length > 24 || /[\u0000-\u001f\u007f]/.test(p.name)) throw new Error('ชื่อต้องยาว 1–24 ตัวอักษร');
  if (!(p.species === 'custom' || SPECIES.includes(p.species as typeof SPECIES[number])) || !FACES.includes(p.face as Pet['face']) || !ACCESSORIES.includes(p.accessory as Pet['accessory'])) throw new Error('รูปแบบตัวละครไม่รองรับ');
  if (typeof p.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(p.color)) throw new Error('สีตัวละครไม่ถูกต้อง');
  if (typeof p.size !== 'number' || !Number.isFinite(p.size) || p.size < 64 || p.size > 160 || typeof p.energy !== 'number' || !Number.isFinite(p.energy) || p.energy < 0 || p.energy > 100) throw new Error('ขนาดหรือความซนอยู่นอกช่วง');
  const outfit = p.outfit ?? 'none', eyewear = p.eyewear ?? 'none';
  if (!OUTFITS.includes(outfit as Pet['outfit']) || !EYEWEAR.includes(eyewear as Pet['eyewear'])) throw new Error('ชุดหรือแว่นตาไม่รองรับ');
  const outfitColor = p.outfitColor ?? DEFAULT_PET.outfitColor, accessoryColor = p.accessoryColor ?? DEFAULT_PET.accessoryColor;
  if (!isColor(outfitColor) || !isColor(accessoryColor)) throw new Error('สีชุดหรือของสวมใส่ไม่ถูกต้อง');
  const drawing = p.species === 'custom' || p.drawing !== undefined ? parseDrawing(p.drawing) : undefined;
  const fit = parseFit(p.fit);
  const speech = p.speech === undefined ? undefined : parseSpeech(p.speech);
  return { version: 1, id: typeof p.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(p.id) ? p.id : crypto.randomUUID(), name: p.name.trim(), species: p.species as Pet['species'], color: p.color, face: p.face as Pet['face'], accessory: p.accessory as Pet['accessory'], outfit: outfit as Pet['outfit'], outfitColor, accessoryColor, eyewear: eyewear as Pet['eyewear'], size: p.size, energy: p.energy, ...(drawing ? { drawing } : {}), ...(fit ? { fit } : {}), ...(speech ? { speech } : {}) };
}
export function parseFile(text: string): Pet {
  if (text.length > MAX_PET_FILE_BYTES) throw new Error('ไฟล์ตัวละครต้องไม่เกิน 32 KB');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('อ่านไฟล์ไม่ได้ กรุณาเลือกไฟล์ .mongbo.json'); }
  return parsePet(value);
}
export function parsePrefs(value: unknown): Preferences {
  const p = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return { enabled: p.enabled !== false, paused: p.paused === true, hiddenSites: Array.isArray(p.hiddenSites) ? p.hiddenSites.filter((s): s is string => typeof s === 'string' && s.length <= 253 && /^[a-z0-9.:[\]-]+$/i.test(s)).slice(0, 500) : [] };
}
export function bounds(x: number, y: number, width: number, height: number, size: number) {
  return { x: Math.max(0, Math.min(x, Math.max(0, width - size))), y: Math.max(0, Math.min(y, Math.max(0, height - size))) };
}
export function upsertPet(list: Pet[], pet: Pet) {
  if (list.length >= 30 && !list.some(p => p.id === pet.id)) throw new Error('คลังเต็มแล้ว ส่งออกเพื่อนเก็บไว้ก่อน แล้วนำตัวที่ไม่ใช้แล้วออกจากคลัง');
  return [pet, ...list.filter(p => p.id !== pet.id)];
}
export function serializePet(pet: Pet) {
  // Dense drawings export compactly to stay within the existing portable-file limit.
  return JSON.stringify(parsePet(pet), null, pet.drawing ? undefined : 2);
}
