import test from 'node:test';
import assert from 'node:assert/strict';
import { floorY, fallStep, swayStep, driftStep, releaseVelocity, projectileStep } from '../src/shared/motion.ts';
import { DEFAULT_PET, FACES, SPECIES, parseFile, serializePet } from '../src/shared/model.ts';
import { petSVG } from '../src/shared/art.ts';

test('ground follows the bottom of the container, including tiny screens', () => {
  assert.equal(floorY(850, 104), 746);
  assert.equal(floorY(60, 104), 0);
});

test('fall accelerates, lands exactly on the floor, and never tunnels through it', () => {
  let y = 20, velocity = 0;
  const first = fallStep(y, velocity, 400, 1 / 60);
  const second = fallStep(first.y, first.velocity, 400, 1 / 60);
  assert.ok(second.y - first.y > first.y - y);
  for (let i = 0; i < 200; i++) {
    const next = fallStep(y, velocity, 400, 1 / 60);
    assert.ok(next.y >= y && next.y <= 400);
    y = next.y; velocity = next.velocity;
  }
  assert.equal(y, 400);
  assert.equal(velocity, 0);
  assert.equal(fallStep(399, 1000, 400, .05).landed, true);
});

test('a suspended tab cannot advance a whole fall in one frame', () => {
  assert.deepEqual(fallStep(0, 0, 1000, 20), fallStep(0, 0, 1000, .05));
});

test('sway follows both directions smoothly and settles when the hand stops', () => {
  const first = swayStep(0, 0, 24, 1 / 60), opposite = swayStep(0, 0, -24, 1 / 60);
  assert.ok(first.angle > 0 && first.angle < 24);
  assert.equal(first.angle, -opposite.angle);
  let { angle, velocity } = first;
  for (let i = 0; i < 60; i++) ({ angle, velocity } = swayStep(angle, velocity, 24, 1 / 60));
  for (let i = 0; i < 300; i++) ({ angle, velocity } = swayStep(angle, velocity, 0, 1 / 60));
  assert.ok(Math.abs(angle) < .01 && Math.abs(velocity) < .01);
  assert.deepEqual(swayStep(10, 50, 0, 20), swayStep(10, 50, 0, .05));
});

test('air drift loses momentum and stays inside both screen edges', () => {
  const right = driftStep(200, 180, 800, 100, .05), left = driftStep(200, -180, 800, 100, .05);
  assert.ok(right.x > 200 && right.velocity < 180);
  assert.ok(left.x < 200 && left.velocity > -180);
  assert.equal(driftStep(699, 180, 800, 100, .05).x, 700);
  assert.ok(driftStep(699, 180, 800, 100, .05).velocity < 0);
  assert.equal(driftStep(1, -180, 800, 100, .05).x, 0);
  assert.deepEqual(driftStep(0, 180, 60, 100, .05), { x: 0, velocity: 0 });
});

test('throw velocity follows both axes, caps fast flicks, and expires when held still', () => {
  assert.deepEqual(releaseVelocity(800, -600, 0), { x: 680, y: -510 });
  assert.deepEqual(releaseVelocity(-800, 600, 0), { x: -680, y: 510 });
  assert.deepEqual(releaseVelocity(10000, -10000, 0), { x: 1100, y: -1000 });
  const stale = releaseVelocity(800, -600, .2);
  assert.equal(Math.abs(stale.x) + Math.abs(stale.y), 0);
});

test('projectile rises, keeps forward momentum through its apex, then lands on the floor', () => {
  let flight = { x: 100, y: 500, vx: 600, vy: -650, landed: false };
  let minimum = flight.y, rose = false, fell = false;
  for (let i = 0; i < 180 && !flight.landed; i++) {
    const next = projectileStep(flight.x, flight.y, flight.vx, flight.vy, 1800, 700, 100, 1 / 60);
    if (next.y < flight.y) rose = true;
    if (next.y > flight.y && rose) fell = true;
    assert.ok(next.x > flight.x);
    minimum = Math.min(minimum, next.y); flight = next;
  }
  assert.ok(rose && fell && minimum < 400);
  assert.equal(flight.y, 600); assert.equal(flight.landed, true); assert.equal(flight.vx, 0);
  assert.ok(flight.x > 450);
});

test('projectile stays inside the screen at ceiling, walls, tiny viewports and suspended frames', () => {
  const ceiling = projectileStep(200, 1, -800, -900, 800, 700, 100, .05);
  assert.equal(ceiling.y, 0); assert.ok(ceiling.vy >= 0);
  assert.equal(projectileStep(699, 200, 1000, -300, 800, 700, 100, .05).x, 700);
  assert.equal(projectileStep(0, 0, 1000, -1000, 60, 60, 100, .05).x, 0);
  assert.deepEqual(projectileStep(100, 200, 600, -500, 800, 700, 100, 20), projectileStep(100, 200, 600, -500, 800, 700, 100, .05));
});

test('footless bodies and hand-drawn characters keep their original anatomy', () => {
  const footless = ['ghost', 'mushroom', 'octopus'];
  for (const species of SPECIES) {
    const svg = petSVG({ ...DEFAULT_PET, species });
    assert.equal(svg.includes('class="mb-legs"'), !footless.includes(species), species);
  }
  const custom = { ...DEFAULT_PET, species: 'custom' as const, drawing: { size: 32 as const, pixels: Array(1024).fill('#abcdef') } };
  assert.ok(!petSVG(custom).includes('mb-legs'));
  assert.ok(!petSVG(custom, 'scared').includes('class="mb-face"'));
  assert.ok(petSVG(custom, 'scared').includes('mb-reaction'));
});

test('all moods render and travel with the pet; temporary fall reactions do not replace its saved mood', () => {
  assert.ok(FACES.length >= 20);
  for (const face of FACES) {
    const pet = { ...DEFAULT_PET, face };
    assert.equal(parseFile(serializePet(pet)).face, face);
    const svg = petSVG(pet);
    assert.ok(!svg.includes('undefined'), face);
    assert.ok(svg.includes(`data-face="${face}"`));
  }
  const pet = { ...DEFAULT_PET, face: 'shy' as const };
  assert.ok(petSVG(pet, 'scared').includes('data-face="scared"'));
  assert.equal(pet.face, 'shy');
});
