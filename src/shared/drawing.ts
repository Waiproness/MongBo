import type { Drawing } from './model.ts';
export const blankDrawing = (): Drawing => ({ size: 32, pixels: Array<string>(1024).fill('') });
export type Point = { x: number; y: number };
export function paintLine(pixels: string[], from: Point, to: Point, color: string, brush = 1): string[] {
  const result = [...pixels];
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(from.x + (to.x - from.x) * s / steps), y = Math.round(from.y + (to.y - from.y) * s / steps);
    for (let dy = 0; dy < brush; dy++) for (let dx = 0; dx < brush; dx++) {
      const px = x + dx - Math.floor(brush / 2), py = y + dy - Math.floor(brush / 2);
      if (px >= 0 && px < 32 && py >= 0 && py < 32) result[py * 32 + px] = color;
    }
  }
  return result;
}
export function floodFill(pixels: string[], point: Point, color: string): string[] {
  const result = [...pixels], start = point.y * 32 + point.x, previous = result[start];
  if (point.x < 0 || point.x > 31 || point.y < 0 || point.y > 31 || previous === color) return result;
  const queue = [start]; result[start] = color;
  for (let i = 0; i < queue.length; i++) {
    const index = queue[i], x = index % 32, y = Math.floor(index / 32);
    for (const next of [x > 0 ? index - 1 : -1, x < 31 ? index + 1 : -1, y > 0 ? index - 32 : -1, y < 31 ? index + 32 : -1]) {
      if (next >= 0 && result[next] === previous) { result[next] = color; queue.push(next); }
    }
  }
  return result;
}
