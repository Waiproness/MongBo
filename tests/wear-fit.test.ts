import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET, SPECIES, parsePet, parseFile, serializePet } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

test('individual wardrobe adjustments survive save/export/import', () => {
  const fit = { outfit: { x: 4, y: -3, scaleX: 1.2, scaleY: .8 }, accessory: { x: -2, y: 5, scaleX: .9, scaleY: 1.1 } };
  const pet = parsePet({ ...DEFAULT_PET, outfit: 'hoodie', fit });
  assert.deepEqual(parseFile(serializePet(pet)).fit, fit);
});
test('rejects non-finite or excessive fitting values from imported files', () => {
  for (const patch of [{ x: Infinity }, { x: 41 }, { y: -41 }, { scaleX: 0 }, { scaleY: 2 }, { x: '10' }]) {
    assert.throws(() => parsePet({ ...DEFAULT_PET, fit: { outfit: { x: 0, y: 0, scaleX: 1, scaleY: 1, ...patch } } }));
  }
});
test('garments are clipped to the character silhouette even after adjustment', () => {
  for (const species of SPECIES) {
    const svg = petSVG(parsePet({ ...DEFAULT_PET, species, outfit: 'hoodie', fit: { outfit: { x: 20, y: 10, scaleX: 1.8, scaleY: 1.8 } } }));
    assert.match(svg, /class="mb-outfit-clip" clip-path="url\(#mb-silhouette-/);
    assert.ok(svg.includes('<clipPath'));
    assert.ok(!svg.includes('undefined'));
  }
});
test('outfit placement adapts to mushroom and penguin bodies', () => {
  const transform = (species: typeof SPECIES[number]) => petSVG({ ...DEFAULT_PET, species, outfit: 'tee' }).match(/class="mb-fitted-outfit" transform="([^"]+)"/)?.[1];
  assert.ok(transform('blob'));
  assert.notEqual(transform('mushroom'), transform('penguin'));
});
