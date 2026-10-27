import { parsePet, parsePrefs, type Pet } from '../src/shared/model.ts';

export type DesktopState = { pet?: Pet; collection?: Pet[]; activeIds?: string[]; language?: 'th' | 'en'; preferences?: ReturnType<typeof parsePrefs> };
const keys = ['pet', 'collection', 'activeIds', 'language', 'preferences'];
export function validatePatch(value: unknown): DesktopState {
  if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(value).length > 2_000_000) throw new Error('Invalid desktop data');
  const data = value as Record<string, unknown>, result: DesktopState = {};
  if (Object.keys(data).some(key => !keys.includes(key))) throw new Error('Unknown desktop setting');
  if ('pet' in data) result.pet = parsePet(data.pet);
  if ('preferences' in data) result.preferences = parsePrefs(data.preferences);
  if ('language' in data) {
    if (data.language !== 'th' && data.language !== 'en') throw new Error('Invalid language');
    result.language = data.language;
  }
  if ('collection' in data) {
    if (!Array.isArray(data.collection) || data.collection.length > 30) throw new Error('Invalid library');
    result.collection = data.collection.map(parsePet);
    if (new Set(result.collection.map(p => p.id)).size !== result.collection.length) throw new Error('Duplicate character IDs');
  }
  if ('activeIds' in data) {
    if (!Array.isArray(data.activeIds) || data.activeIds.length > 30 || data.activeIds.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id))) throw new Error('Invalid visible characters');
    result.activeIds = [...new Set(data.activeIds as string[])];
  }
  return result;
}

export function validateRegions(value: unknown): { x: number; y: number; width: number; height: number }[] {
  if (!Array.isArray(value) || value.length > 30) throw new Error('Invalid hit regions');
  return value.map(rect => {
    if (!rect || ['x', 'y', 'width', 'height'].some(key => typeof rect[key] !== 'number' || !Number.isFinite(rect[key]) || Math.abs(rect[key]) > 100_000) || rect.width < 0 || rect.height < 0) throw new Error('Invalid hit region');
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
}
