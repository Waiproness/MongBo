import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePatch, validateRegions } from '../desktop/state.ts';
import { DEFAULT_PET } from '../src/shared/model.ts';

test('desktop IPC accepts only bounded validated character settings', () => {
  const valid = validatePatch({ pet: DEFAULT_PET, collection: [DEFAULT_PET], activeIds: [DEFAULT_PET.id], language: 'th' });
  assert.equal(valid.pet?.id, DEFAULT_PET.id);
  assert.throws(() => validatePatch({ file: 'C:/private.txt' }));
  assert.throws(() => validatePatch({ pet: { ...DEFAULT_PET, name: '<svg>', size: Infinity } }));
  assert.throws(() => validatePatch({ collection: Array(31).fill(DEFAULT_PET) }));
  assert.throws(() => validatePatch({ collection: [DEFAULT_PET, DEFAULT_PET] }));
  assert.throws(() => validatePatch({ activeIds: ['../../file'] }));
  assert.throws(() => validatePatch({ language: 'unknown' }));
  assert.deepEqual(validatePatch({ activeIds: [] }), { activeIds: [] });
});
test('desktop hit regions reject malformed coordinates and oversized updates', () => {
  assert.deepEqual(validateRegions([{ x: 10, y: 20, width: 104, height: 104 }]), [{ x: 10, y: 20, width: 104, height: 104 }]);
  assert.throws(() => validateRegions([{ x: NaN, y: 0, width: 104, height: 104 }]));
  assert.throws(() => validateRegions([{ x: 0, y: 0, width: -1, height: 104 }]));
  assert.throws(() => validateRegions(Array(31).fill({ x: 0, y: 0, width: 1, height: 1 })));
});
