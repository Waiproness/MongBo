export function floorY(height: number, size: number): number { return Math.max(0, height - size); }

/** Integrate gravity with a bounded frame so tab suspension cannot cause a large jump. */
export function fallStep(y: number, velocity: number, floor: number, elapsed: number) {
  const dt = Math.max(0, Math.min(elapsed, .05));
  const speed = Math.min(1200, velocity + 1800 * dt);
  const position = Math.min(floor, y + (velocity + speed) * dt / 2);
  const landed = position >= floor;
  return { y: position, velocity: landed ? 0 : speed, landed };
}

/** A lightly damped swing follows the hand, then settles without snapping. */
export function swayStep(angle: number, velocity: number, target: number, elapsed: number) {
  const dt = Math.max(0, Math.min(elapsed, .05)), steps = Math.max(1, Math.ceil(dt * 120));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) {
    velocity += ((target - angle) * 100 - velocity * 12) * step;
    angle += velocity * step;
  }
  return { angle, velocity };
}

export function driftStep(x: number, velocity: number, width: number, size: number, elapsed: number) {
  const dt = Math.max(0, Math.min(elapsed, .05)), edge = Math.max(0, width - size);
  const drag = .35, speed = velocity * Math.exp(-drag * dt);
  const position = x + (velocity - speed) / drag;
  const bounded = Math.max(0, Math.min(edge, position));
  return { x: bounded, velocity: edge === 0 ? 0 : bounded !== position ? -speed * .18 : speed };
}

/** A stale hand movement is a drop, not a throw. Speeds are pixels per second. */
export function releaseVelocity(x: number, y: number, age: number) {
  const scale = Math.max(0, 1 - Math.max(0, age) / .12) * .85;
  return { x: Math.max(-1100, Math.min(1100, x * scale)), y: Math.max(-1000, Math.min(1000, y * scale)) };
}

export function projectileStep(x: number, y: number, vx: number, vy: number, width: number, height: number, size: number, elapsed: number) {
  const fall = fallStep(y, vy, floorY(height, size), elapsed);
  const drift = driftStep(x, vx, width, size, elapsed);
  return { x: drift.x, y: Math.max(0, fall.y), vx: fall.landed ? 0 : drift.velocity, vy: fall.y < 0 ? Math.max(0, fall.velocity) : fall.velocity, landed: fall.landed };
}
