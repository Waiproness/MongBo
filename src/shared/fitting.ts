import { DEFAULT_FIT, type Pet, type WearLayer } from './model.ts';

// Torso width, neckline, hemline, head attachment height, head width.
const ANATOMY: Record<Exclude<Pet['species'], 'custom'>, readonly [number, number, number, number, number]> = {
  blob: [74, 74, 99, 34, 74], cat: [70, 75, 98, 34, 70], bunny: [64, 74, 97, 34, 64], bot: [74, 75, 95, 34, 74],
  bear: [70, 76, 98, 34, 70], fox: [68, 76, 98, 35, 70], frog: [78, 75, 98, 34, 78], panda: [70, 76, 98, 33, 70],
  chick: [66, 76, 98, 29, 66], penguin: [64, 76, 98, 27, 64], ghost: [72, 74, 93, 26, 72], axolotl: [68, 75, 98, 37, 68],
  mushroom: [48, 75, 98, 18, 80], dragon: [66, 75, 98, 34, 70], puppy: [62, 76, 98, 35, 64], octopus: [72, 74, 92, 28, 72],
};
function anatomy(p: Pet) {
  if (p.species !== 'custom') {
    const [width, neck, hem, headY, headWidth] = ANATOMY[p.species];
    return { center: 60, width, neck, hem, headY, headWidth, faceY: 62 };
  }
  const cells = p.drawing!.pixels.map((color, i) => color ? i : -1).filter(i => i >= 0);
  const left = 12 + Math.min(...cells.map(i => i % 32)) * 3, right = 15 + Math.max(...cells.map(i => i % 32)) * 3;
  const top = 6 + Math.min(...cells.map(i => Math.floor(i / 32))) * 3, bottom = 9 + Math.max(...cells.map(i => Math.floor(i / 32))) * 3;
  return { center: (left + right) / 2, width: right - left, neck: top + (bottom - top) * .68, hem: bottom, headY: top + 2, headWidth: right - left, faceY: top + (bottom - top) * .48 };
}
export function fitTransform(p: Pet, layer: WearLayer): string {
  const a = anatomy(p), fit = p.fit?.[layer] ?? DEFAULT_FIT;
  const source = layer === 'outfit' ? { x: 60, y: 83 } : layer === 'accessory' ? { x: 60, y: 38 } : { x: 60, y: 62 };
  const baseX = layer === 'outfit' ? a.width / 76 * (p.outfit === 'cape' ? 1.25 : 1) : layer === 'accessory' ? a.headWidth / 74 : Math.min(a.width / 74, 1.05);
  const baseY = layer === 'outfit' ? Math.max(a.hem - a.neck, 3) / 28 : baseX;
  const targetY = layer === 'outfit' ? (a.neck + a.hem) / 2 : layer === 'accessory' ? a.headY : a.faceY;
  const sx = baseX * fit.scaleX, sy = baseY * fit.scaleY;
  return `matrix(${[sx, 0, 0, sy, a.center + fit.x - source.x * sx, targetY + fit.y - source.y * sy].map(n => Number(n.toFixed(4))).join(' ')})`;
}
export function foregroundLimbs(p: Pet): string {
  if (p.species === 'custom') return '';
  const shapes: Partial<Record<Pet['species'], readonly [string, string]>> = {
    penguin: ['<path d="M25 62 13 85l15-5Z"/>', '<path d="m95 62 12 23-15-5Z"/>'],
    chick: ['<path d="M25 69q-11 9 0 17"/>', '<path d="M95 69q11 9 0 17"/>'],
    bot: ['<rect x="14" y="54" width="10" height="23" rx="5"/>', '<rect x="96" y="54" width="10" height="23" rx="5"/>'],
    dragon: ['<path d="M25 65 9 50l4 29 15-1Z"/>', '<path d="m95 65 16-15-4 29-15-1Z"/>'],
  };
  const pair = shapes[p.species];
  if (!pair) return '';
  return `<g class="mb-front-limbs" fill="${p.color}" stroke="#414145" stroke-width="2.3" stroke-linejoin="round">${pair[0]}${pair[1]}</g>`;
}
