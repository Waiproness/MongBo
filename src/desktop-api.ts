import type { ExtensionAPI } from './shared/browser.ts';
export type HitRegion = { x: number; y: number; width: number; height: number };
export type DesktopBridge = {
  api: ExtensionAPI;
  regions(rects: HitRegion[]): void;
  dragging(active: boolean): void;
  menu(id: string): Promise<void>;
  onSpeak(fn: (id: string) => void): void;
};
export function desktopBridge(): DesktopBridge | undefined {
  return (globalThis as unknown as { mongboDesktop?: DesktopBridge }).mongboDesktop;
}
