import { Sw5eMonster, Sw5eSpecies } from '../types/sw5e';
import rawSpecies from '../resources/starwars/species.json';
import rawMonsters from '../resources/starwars/monsters.json';

// Cast and sort datasets alphabetically
const speciesList: Sw5eSpecies[] = ((rawSpecies as unknown) as Sw5eSpecies[]).sort((a, b) => a.name.localeCompare(b.name));
const monstersList: Sw5eMonster[] = ((rawMonsters as unknown) as Sw5eMonster[]).sort((a, b) => a.name.localeCompare(b.name));

/**
 * Returns all 141 SW5e species sorted alphabetically
 */
export function getAllSpecies(): Sw5eSpecies[] {
  return speciesList;
}

/**
 * Returns all 271 SW5e monsters sorted alphabetically
 */
export function getAllMonsters(): Sw5eMonster[] {
  return monstersList;
}

/**
 * Parse challenge rating string into a numerical value for sorting and comparison
 */
export function parseCR(crStr?: string): number {
  if (!crStr) return 0;
  const clean = crStr.trim().split(' ')[0];
  if (clean === '1/8') return 0.125;
  if (clean === '1/4') return 0.25;
  if (clean === '1/2') return 0.5;
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

/**
 * Calculate D&D ability modifier string from score (e.g. 10 -> '(+0)', 14 -> '(+2)')
 */
export function calculateModifier(score: number): string {
  if (isNaN(score)) return '(+0)';
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `(+${mod})` : `(${mod})`;
}

/**
 * Filter species by query string (name, distinctions, homeworld, traits) and optional size
 */
export function filterSpecies(query: string = '', size: string = 'all'): Sw5eSpecies[] {
  const cleanQuery = query.trim().toLowerCase();
  return speciesList.filter(s => {
    if (size !== 'all' && s.size !== size) {
      return false;
    }
    if (!cleanQuery) return true;

    const matchesName = s.name.toLowerCase().includes(cleanQuery);
    const matchesHomeworld = s.homeworld ? s.homeworld.toLowerCase().includes(cleanQuery) : false;
    const matchesDistinctions = s.distinctions ? s.distinctions.toLowerCase().includes(cleanQuery) : false;
    const matchesTraits = s.traits ? s.traits.some(t => t.name.toLowerCase().includes(cleanQuery)) : false;

    return matchesName || matchesHomeworld || matchesDistinctions || matchesTraits;
  });
}

/**
 * Filter monsters by search query (name, types), CR range, and size
 */
export function filterMonsters(
  query: string = '',
  minCR: string = 'all',
  maxCR: string = 'all',
  size: string = 'all',
  type: string = 'all'
): Sw5eMonster[] {
  const cleanQuery = query.trim().toLowerCase();

  return monstersList.filter(m => {
    // 1. Text search
    if (cleanQuery) {
      const matchesName = m.name.toLowerCase().includes(cleanQuery);
      const matchesType = m.types ? m.types.some(t => t.toLowerCase().includes(cleanQuery)) : false;
      const matchesAlignment = m.alignment ? m.alignment.toLowerCase().includes(cleanQuery) : false;
      if (!matchesName && !matchesType && !matchesAlignment) {
        return false;
      }
    }

    // 2. Size filter
    if (size !== 'all' && m.size !== size) {
      return false;
    }

    // 3. Type filter
    if (type !== 'all' && m.types && !m.types.some(t => t.toLowerCase().includes(type.toLowerCase()))) {
      return false;
    }

    // 4. Challenge Rating range filter
    const cr = parseCR(m.challengeRating);
    if (minCR !== 'all') {
      const minVal = parseFloat(minCR);
      if (!isNaN(minVal) && cr < minVal) return false;
    }
    if (maxCR !== 'all') {
      const maxVal = parseFloat(maxCR);
      if (!isNaN(maxVal) && cr > maxVal) return false;
    }

    return true;
  });
}

/**
 * Helper to get primary image for a species
 */
export function getSpeciesImageUrl(species: Sw5eSpecies): string | null {
  if (species.imageUrls && species.imageUrls.length > 0 && species.imageUrls[0]) {
    return species.imageUrls[0];
  }
  return null;
}

/**
 * Helper to get primary image for a monster
 */
export function getMonsterImageUrl(monster: Sw5eMonster): string | null {
  if (monster.imageUrls && monster.imageUrls.length > 0 && monster.imageUrls[0]) {
    return monster.imageUrls[0];
  }
  return null;
}
