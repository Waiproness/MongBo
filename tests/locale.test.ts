import test from 'node:test';
import assert from 'node:assert/strict';
import { LABELS } from '../src/shared/model.ts';
import { EN } from '../src/shared/en.ts';
import { parseLanguage, translate } from '../src/shared/locale.ts';

test('language settings accept EN/TH and recover invalid saved values', () => {
  assert.equal(parseLanguage('en'), 'en'); assert.equal(parseLanguage('th'), 'th');
  for (const value of [null, {}, 'EN', '<script>', 'fr']) assert.equal(parseLanguage(value), 'th');
});
test('all character and wardrobe labels have English translations', () => {
  for (const label of Object.values(LABELS)) assert.ok(EN[label], label);
});
test('catalog translations preserve dynamic placeholders', () => {
  const slots = (s: string) => [...s.matchAll(/\{\d+\}/g)].map(m => m[0]).sort();
  for (const [source, target] of Object.entries(EN)) assert.deepEqual(slots(source), slots(target), source);
});
test('translation changes interface copy while keeping names and interpolated content verbatim', () => {
  assert.equal(translate('เก็บเพื่อนตัวนี้', 'en'), 'Save friend');
  assert.equal(translate('เก็บเพื่อนตัวนี้', 'th'), 'เก็บเพื่อนตัวนี้');
  assert.equal(translate('นำ {0} ออกจากคลัง', 'en', 'พี่โบ๋ <b>'), 'Remove พี่โบ๋ <b> from collection');
  assert.equal(translate(' สีตัวละคร ', 'en'), ' Body color ');
  assert.equal(translate('My own words', 'en'), 'My own words');
});
