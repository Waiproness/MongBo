import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, COLORS, DEFAULT_PET, EYEWEAR, OUTFITS, SPECIES, type Pet } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

function greenCast(color: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  return g > r && g > b;
}

test('neutral character selections have no baked-in green in any species or wearable', () => {
  const neutral: Pet = { ...DEFAULT_PET, color: '#eeeeee', outfitColor: '#999999', accessoryColor: '#bbbbbb' };
  const variants = [
    ...SPECIES.map(species => ({ ...neutral, species })),
    ...OUTFITS.map(outfit => ({ ...neutral, outfit })),
    ...ACCESSORIES.map(accessory => ({ ...neutral, accessory })),
    ...EYEWEAR.map(eyewear => ({ ...neutral, eyewear })),
  ];
  for (const pet of variants) {
    const colors = petSVG(pet).match(/#[0-9a-f]{6}(?:[0-9a-f]{2})?\b/gi) ?? [];
    for (const color of colors) assert.ok(!greenCast(color), `${pet.species}/${pet.outfit}/${pet.accessory}/${pet.eyewear}: ${color}`);
  }
  for (const color of COLORS) assert.ok(!greenCast(color), `preset ${color}`);
});

test('panda markings and garment outlines are neutral gray', () => {
  const svg = petSVG({ ...DEFAULT_PET, species: 'panda', color: '#ffffff', outfit: 'hoodie', accessory: 'chef', eyewear: 'sun' });
  for (const color of ['#30433d', '#425049', '#7b8277', '#425447', '#435343', '#364947']) assert.ok(!svg.includes(color));
});

test('arbitrary colors chosen by the owner and hand-drawn pixels stay intact', () => {
  const svg = petSVG({ ...DEFAULT_PET, color: '#00ff00', outfit: 'tee', outfitColor: '#00ee00', accessory: 'cap', accessoryColor: '#00dd00' });
  assert.ok(svg.includes('fill="#00ff00"'));
  assert.ok(svg.includes('stop-color="#00ee00"'));
  assert.ok(svg.includes('fill="#00dd00"'));
  const drawing = { size: 32 as const, pixels: Array(1024).fill('#00ff00') };
  assert.ok(petSVG({ ...DEFAULT_PET, species: 'custom', drawing }).includes('fill="#00ff00"'));
});
