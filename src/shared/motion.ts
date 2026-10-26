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
  const speed = velocity * Math.exp(-4 * dt);
  const position = x + (velocity - speed) / 4;
  const bounded = Math.max(0, Math.min(edge, position));
  return { x: bounded, velocity: edge === 0 ? 0 : bounded !== position ? -speed * .18 : speed };
}
