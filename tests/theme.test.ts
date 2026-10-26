import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTheme, resolveTheme } from '../src/shared/theme.ts';
test('invalid stored preferences fall back to system', () => {
  for (const value of [null, '', '<script>', {}, 'Dark']) assert.equal(parseTheme(value), 'system');
  assert.equal(parseTheme('dark'), 'dark');
});
test('explicit theme overrides OS; system follows it', () => {
  assert.equal(resolveTheme('light', true), 'light'); assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('system', true), 'dark'); assert.equal(resolveTheme('system', false), 'light');
});
