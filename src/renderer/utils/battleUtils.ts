import { Combatant, CombatGroup } from '../types/battle';

/**
 * Ordena os combatentes por iniciativa em ordem decrescente.
 * Em caso de empate: jogadores primeiro, depois por nome.
 */
export function sortCombatants(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    // 1. Iniciativa (Maior primeiro)
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    // 2. Empate: Jogadores antes de Inimigos
    if (a.type !== b.type) {
      return a.type === 'player' ? -1 : 1;
    }
    // 3. Empate: Ordem alfabética
    return a.name.localeCompare(b.name);
  });
}

/**
 * Agrupa combatentes consecutivos do mesmo tipo (jogadores ou inimigos)
 * na fila de iniciativa quando não há adversários intercalados.
 */
export function computeCombatGroups(sortedCombatants: Combatant[]): CombatGroup[] {
  if (sortedCombatants.length === 0) return [];

  const groups: CombatGroup[] = [];
  let currentGroup: Combatant[] = [];
  let currentType: 'player' | 'enemy' = sortedCombatants[0].type;

  for (let i = 0; i < sortedCombatants.length; i++) {
    const combatant = sortedCombatants[i];

    if (combatant.type === currentType) {
      currentGroup.push(combatant);
    } else {
      // Finaliza o grupo anterior
      if (currentGroup.length > 0) {
        const inits = currentGroup.map(c => c.initiative);
        groups.push({
          groupId: `group-${groups.length + 1}-${currentType}-${currentGroup[0].id}`,
          type: currentType,
          isSharedTurn: currentGroup.length > 1,
          initiativeRange: {
            min: Math.min(...inits),
            max: Math.max(...inits)
          },
          combatants: currentGroup
        });
      }
      // Inicia novo grupo
      currentType = combatant.type;
      currentGroup = [combatant];
    }
  }

  // Adiciona o último grupo
  if (currentGroup.length > 0) {
    const inits = currentGroup.map(c => c.initiative);
    groups.push({
      groupId: `group-${groups.length + 1}-${currentType}-${currentGroup[0].id}`,
      type: currentType,
      isSharedTurn: currentGroup.length > 1,
      initiativeRange: {
        min: Math.min(...inits),
        max: Math.max(...inits)
      },
      combatants: currentGroup
    });
  }

  return groups;
}

/**
 * Rola um dado de N lados (ex: d20).
 */
export function rollD20(modifier: number = 0): number {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + modifier;
}

/**
 * Extrai o valor numérico de AC a partir de strings como "15 (natural armor)" ou "16".
 */
export function parseAcString(acStr?: string | number): number {
  if (typeof acStr === 'number') return acStr;
  if (!acStr) return 10;
  const match = acStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
}

/**
 * Extrai o valor de HP médio a partir de strings como "22 (4d8 + 4)" ou "45".
 */
export function parseHpString(hpStr?: string | number): number {
  if (typeof hpStr === 'number') return hpStr;
  if (!hpStr) return 10;
  const match = hpStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
}
