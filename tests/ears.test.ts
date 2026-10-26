import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PET, SPECIES } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

test('no generated arms remain on any character', () => {
  for (const species of SPECIES) assert.ok(!petSVG({ ...DEFAULT_PET, species }).includes('mb-arm-'), species);
});
test('only characters with actual ears receive moving ear groups', () => {
  const eared = ['cat', 'bunny', 'bear', 'fox', 'panda', 'puppy'];
  for (const species of SPECIES) {
    const svg = petSVG({ ...DEFAULT_PET, species });
    assert.equal(svg.includes('class="mb-ear-left"'), eared.includes(species), species);
    assert.equal(svg.includes('class="mb-ear-right"'), eared.includes(species), species);
  }
});
