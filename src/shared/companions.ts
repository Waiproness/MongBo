import { parsePet, upsertPet, type Pet } from './model.ts';

export function companionLibrary(pet: Pet, collection: Pet[]): Pet[] {
  return collection.some(p => p.id === pet.id) ? collection : [pet, ...collection];
}
export function visibleCompanions(pet: Pet, collection: Pet[], value: unknown): Pet[] {
  const ids = Array.isArray(value) ? new Set(value.filter(id => typeof id === 'string')) : new Set([pet.id]);
  return companionLibrary(pet, collection).filter(p => ids.has(p.id));
}
export function addCompanion(pet: Pet, collection: Pet[], visible: Pet[], imported: Pet) {
  const library = visible.some(p => p.id === pet.id) ? companionLibrary(pet, collection) : collection;
  const next = parsePet({ ...imported, id: library.some(p => p.id === imported.id) ? crypto.randomUUID() : imported.id });
  return { collection: upsertPet(library, next), activeIds: [...new Set([...visible.map(p => p.id), next.id])] };
}
