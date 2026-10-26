import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET } from '../src/shared/model.ts';
import { addCompanion, visibleCompanions } from '../src/shared/companions.ts';

test('legacy storage keeps the original pet; explicit empty selection hides everyone', () => {
  assert.deepEqual(visibleCompanions(DEFAULT_PET, [], undefined), [DEFAULT_PET]);
  assert.deepEqual(visibleCompanions(DEFAULT_PET, [], []), []);
});
test('import adds a visible companion without replacing the current pet, even for duplicate IDs', () => {
  const result = addCompanion(DEFAULT_PET, [], [DEFAULT_PET], { ...DEFAULT_PET, name: 'Second' });
  assert.equal(result.collection.length, 2);
  assert.equal(result.activeIds.length, 2);
  assert.notEqual(result.collection[0].id, DEFAULT_PET.id);
  assert.equal(visibleCompanions(DEFAULT_PET, result.collection, result.activeIds).length, 2);
});
test('adding after deleting all pets does not resurrect the default; full collections are preserved', () => {
  const result = addCompanion(DEFAULT_PET, [], [], { ...DEFAULT_PET, id: 'new' });
  assert.deepEqual(result.activeIds, ['new']);
  assert.equal(result.collection.length, 1);
  const full = Array.from({ length: 30 }, (_, i) => ({ ...DEFAULT_PET, id: `pet-${i}` }));
  assert.throws(() => addCompanion(full[0], full, [], { ...DEFAULT_PET, id: 'extra' }));
  assert.equal(full.length, 30);
});
