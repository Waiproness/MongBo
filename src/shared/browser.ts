import { DEFAULT_PET, parsePet, parsePrefs, type Pet, type Preferences } from './model.ts';
import { parseLanguage } from './locale.ts';
type Storage = { get(keys: string[]): Promise<Record<string, unknown>>; set(values: Record<string, unknown>): Promise<void> };
export type ExtensionAPI = {
  storage: { local: Storage; onChanged: { addListener(fn: (changes: Record<string, unknown>, area: string) => void): void; removeListener(fn: (changes: Record<string, unknown>, area: string) => void): void } };
  runtime: { id: string; getURL(path: string): string; sendMessage(message: unknown): Promise<unknown> };
  tabs: { create(details: { url: string }): Promise<unknown>; query(details: { active: boolean; currentWindow: boolean }): Promise<{ url?: string; id?: number }[]> };
};
export function extensionAPI(): ExtensionAPI | undefined { return (globalThis as unknown as { chrome?: ExtensionAPI }).chrome?.runtime?.id ? (globalThis as unknown as { chrome: ExtensionAPI }).chrome : undefined; }
export async function readExtension() {
  const api = extensionAPI(); if (!api) throw new Error('เปิดหน้านี้ผ่านส่วนขยาย MongBo');
  const data = await api.storage.local.get(['pet', 'preferences', 'collection', 'language']);
  let pet: Pet = DEFAULT_PET; try { if (data.pet) pet = parsePet(data.pet); } catch { /* Recover corrupt local settings with a known safe pet. */ }
  return { pet, preferences: parsePrefs(data.preferences), collection: safeCollection(data.collection), language: parseLanguage(data.language) };
}
export function safeCollection(value: unknown): Pet[] {
  if (!Array.isArray(value)) return [];
  const result: Pet[] = [];
  for (const p of value.slice(0, 30)) { try { result.push(parsePet(p)); } catch { /* Skip only invalid entries, preserve the rest. */ } }
  return result;
}
export async function writePreferences(preferences: Preferences) { const api = extensionAPI(); if (!api) throw new Error('ส่วนขยายไม่พร้อม'); await api.storage.local.set({ preferences: parsePrefs(preferences) }); }
export function download(contents: BlobPart, name: string, type = 'application/json') {
  const blob = new Blob([contents], { type }), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
