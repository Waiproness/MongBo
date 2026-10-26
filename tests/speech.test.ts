import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET, MAX_PET_FILE_BYTES, parsePet, parseFile, serializePet } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

test('custom speech and timing survive portable character round trip', () => {
  const speech = { messages: ['พักสายตาหน่อยไหม ♡', 'วันนี้ทำได้ดีแล้ว', '<b>เป็นข้อความธรรมดา</b>'], auto: true, interval: 30 };
  const pet = parsePet({ ...DEFAULT_PET, speech });
  assert.deepEqual(parseFile(serializePet(pet)).speech, speech);
});
test('rejects malformed speech, excessive messages and invalid timer values', () => {
  for (const speech of [null, { messages: [''], auto: false, interval: 30 }, { messages: ['x'.repeat(121)], auto: false, interval: 30 }, { messages: Array(21).fill('hi'), auto: false, interval: 30 }, { messages: [123], auto: false, interval: 30 }, { messages: ['hello'], auto: 'yes', interval: 30 }, { messages: ['hello'], auto: true, interval: 1 }, { messages: ['hello'], auto: true, interval: Infinity }]) assert.throws(() => parsePet({ ...DEFAULT_PET, speech }));
});
test('speech content is never embedded in SVG markup', () => {
  const svg = petSVG(parsePet({ ...DEFAULT_PET, speech: { messages: ['<img src=x onerror=alert(1)>'], auto: false, interval: 30 } }));
  assert.ok(!svg.includes('onerror'));
});
test('both feet draw in front of the body so its sway cannot cover a step', () => {
  const svg = petSVG({ ...DEFAULT_PET, species: 'penguin' });
  assert.ok(svg.indexOf('class="mb-legs"') > svg.indexOf('class="mb-body"'));
});
test('dense custom art and the full Thai message collection fit the file byte limit', () => {
  const pet = parsePet({ ...DEFAULT_PET, species: 'custom', drawing: { size: 32, pixels: Array(1024).fill('#abcdef') }, speech: { messages: Array(20).fill('ก'.repeat(120)), auto: false, interval: 45 } });
  const text = serializePet(pet); assert.ok(Buffer.byteLength(text, 'utf8') <= MAX_PET_FILE_BYTES); assert.deepEqual(parseFile(text), pet);
});
