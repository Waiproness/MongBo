import { petSVG } from '../shared/art.ts';
import type { Pet as PetData } from '../shared/model.ts';
export function Pet({ pet, className = '' }: { pet: PetData; className?: string }) { return <span className={`pet-art ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: petSVG(pet) }}/>; }
