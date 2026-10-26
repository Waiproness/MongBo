import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET, MAX_PET_FILE_BYTES, parsePet, parseFile, parsePrefs, bounds, upsertPet } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

test('portable character round trips without unknown fields', () => {
  assert.deepEqual(parseFile(JSON.stringify({ ...DEFAULT_PET, name: 'เพื่อนใหม่', admin: true })), { ...DEFAULT_PET, name: 'เพื่อนใหม่' });
});
test('rejects malicious SVG fields and invalid numeric bounds', () => {
  for (const patch of [{ color: 'red" onload="alert(1)' }, { species: '__proto__' }, { accessory: '<script>' }, { face: 'constructor' }, { size: Infinity }, { size: -1 }, { energy: NaN }, { energy: 101 }, { version: 2 }, { name: '' }, { name: 'x'.repeat(25) }]) assert.throws(() => parsePet({ ...DEFAULT_PET, ...patch }));
  assert.throws(() => parseFile(' '.repeat(MAX_PET_FILE_BYTES + 1)));
  assert.throws(() => parseFile('{broken'));
});
test('user names are never embedded into SVG markup', () => {
  const svg = petSVG({ ...DEFAULT_PET, name: '<img src=x onerror=1>' });
  assert.equal(svg.includes('<img'), false);
  assert.equal(svg.includes('onerror'), false);
});
test('bounds handle tiny viewports and resize overflow', () => {
  assert.deepEqual(bounds(-30, 900, 500, 400, 100), { x: 0, y: 300 });
  assert.deepEqual(bounds(100, 100, 40, 60, 100), { x: 0, y: 0 });
});
test('preferences fail safe and constrain blocked hosts', () => {
  assert.deepEqual(parsePrefs(null), { enabled: true, paused: false, hiddenSites: [] });
  assert.deepEqual(parsePrefs({ enabled: false, paused: true, hiddenSites: ['example.com', 12, '<script>', 'x'.repeat(300)] }), { enabled: false, paused: true, hiddenSites: ['example.com'] });
});
test('saving edits updates the existing friend; full collection never silently discards a friend', () => {
  const list = Array.from({ length: 30 }, (_, i) => ({ ...DEFAULT_PET, id: `pet-${i}` }));
  const edited = { ...list[4], name: 'แก้ชื่อ' };
  assert.equal(upsertPet(list, edited).length, 30);
  assert.equal(upsertPet(list, edited)[0].name, 'แก้ชื่อ');
  assert.throws(() => upsertPet(list, { ...DEFAULT_PET, id: 'new' }), /คลังเต็ม/);
  assert.equal(list.at(-1)?.id, 'pet-29');
});
