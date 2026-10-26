import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET, SPECIES, ACCESSORIES, OUTFITS, EYEWEAR, parsePet, parseDrawing, normalizeHex, parseFile, serializePet } from '../src/shared/model.ts';
import { blankDrawing, paintLine, floodFill } from '../src/shared/drawing.ts';
import { petSVG } from '../src/shared/art.ts';

test('accepts arbitrary HEX colors and expands shorthand without accepting CSS injection', () => {
  assert.equal(normalizeHex(' A3F '), '#aa33ff');
  assert.equal(normalizeHex('#012ABf'), '#012abf');
  assert.equal(normalizeHex('red;stroke:url(x)'), null);
  assert.equal(normalizeHex('#12345678'), null);
});
test('older version 1 files receive wardrobe defaults and preserve original character', () => {
  const old = { ...DEFAULT_PET } as Record<string, unknown>;
  delete old.outfit; delete old.outfitColor; delete old.accessoryColor; delete old.eyewear;
  assert.deepEqual(parsePet(old), DEFAULT_PET);
});
test('drawing validation rejects blank characters, malformed grids and injected colors', () => {
  assert.throws(() => parseDrawing(blankDrawing()));
  assert.throws(() => parseDrawing({ size: 32, pixels: ['#abcdef'] }));
  const drawing = blankDrawing(); drawing.pixels[100] = '<script>';
  assert.throws(() => parseDrawing(drawing));
  assert.throws(() => parsePet({ ...DEFAULT_PET, species: 'custom' }));
  assert.throws(() => parsePet({ ...DEFAULT_PET, outfit: '__proto__' }));
  assert.throws(() => parsePet({ ...DEFAULT_PET, accessoryColor: 'url(x)' }));
});
test('full custom drawings fit the portable file limit and survive round trip', () => {
  const drawing = blankDrawing(); drawing.pixels.fill('#123456');
  const pet = parsePet({ ...DEFAULT_PET, species: 'custom', drawing, outfit: 'hoodie', eyewear: 'round' });
  const text = serializePet(pet); assert.ok(text.length <= 16384); assert.deepEqual(parseFile(text), pet);
});
test('fast diagonal strokes stay continuous; eraser and broad brush stay inside canvas', () => {
  const pixels = paintLine(blankDrawing().pixels, { x: 0, y: 0 }, { x: 31, y: 31 }, '#ffffff');
  for (let n = 0; n < 32; n++) assert.equal(pixels[n * 33], '#ffffff');
  const erased = paintLine(pixels, { x: 0, y: 0 }, { x: 0, y: 0 }, '', 3);
  assert.equal(erased[0], ''); assert.equal(erased.length, 1024); assert.equal(pixels[0], '#ffffff');
});
test('flood fill respects a closed border and never changes the source array', () => {
  let pixels = blankDrawing().pixels;
  pixels = paintLine(pixels, { x: 0, y: 10 }, { x: 31, y: 10 }, '#000000');
  const filled = floodFill(pixels, { x: 5, y: 5 }, '#ff0000');
  assert.equal(filled[0], '#ff0000'); assert.equal(filled[320], '#000000'); assert.equal(filled[1023], ''); assert.equal(pixels[0], '');
});
test('every catalog option renders safe artwork; custom pixels add no unintended face or feet', () => {
  const combinations = [...SPECIES.map(species => ({ ...DEFAULT_PET, species })), ...ACCESSORIES.map(accessory => ({ ...DEFAULT_PET, accessory })), ...OUTFITS.map(outfit => ({ ...DEFAULT_PET, outfit })), ...EYEWEAR.map(eyewear => ({ ...DEFAULT_PET, eyewear }))];
  for (const pet of combinations) { const svg = petSVG(pet); assert.ok(svg.startsWith('<svg')); assert.ok(!svg.includes('undefined')); assert.ok(!svg.includes('NaN')); assert.ok(!svg.includes('<script')); }
  const drawing = blankDrawing(); drawing.pixels[0] = '#abcdef';
  const svg = petSVG({ ...DEFAULT_PET, species: 'custom', drawing, accessory: 'none' });
  assert.ok(svg.includes('shape-rendering="crispEdges"')); assert.ok(svg.includes('fill="#abcdef"')); assert.ok(!svg.includes('mb-legs'));
});
