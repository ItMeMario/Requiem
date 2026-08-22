export type CombatantType = 'player' | 'enemy';

export interface CombatCondition {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  description?: string;
}

export const DEFAULT_CONDITIONS: CombatCondition[] = [
  { id: 'blinded', name: 'Blinded', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', description: 'Cannot see; attack rolls against have advantage, attacks have disadvantage.' },
  { id: 'charmed', name: 'Charmed', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40', description: 'Cannot harm charmer; charmer has social advantage.' },
  { id: 'deafened', name: 'Deafened', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', description: 'Cannot hear; fails hearing-based ability checks.' },
  { id: 'frightened', name: 'Frightened', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', description: 'Disadvantage on ability checks/attacks while source is in sight; cannot move closer.' },
  { id: 'grappled', name: 'Grappled', color: 'bg-amber-600/20 text-amber-300 border-amber-600/40', description: 'Speed becomes 0.' },
  { id: 'incapacitated', name: 'Incapacitated', color: 'bg-red-500/20 text-red-300 border-red-500/40', description: 'Cannot take actions or reactions.' },
  { id: 'invisible', name: 'Invisible', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', description: 'Impossible to see without special senses; attack advantage, attacks against have disadvantage.' },
  { id: 'paralyzed', name: 'Paralyzed', color: 'bg-rose-600/20 text-rose-300 border-rose-600/40', description: 'Incapacitated, cannot move/speak; auto-fails STR/DEX saves; attacks against have advantage and crit within 5ft.' },
  { id: 'poisoned', name: 'Poisoned', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', description: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone', name: 'Prone', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', description: 'Can only crawl; disadvantage on attack rolls; melee attacks against have advantage, ranged have disadvantage.' },
  { id: 'restrained', name: 'Restrained', color: 'bg-amber-700/20 text-amber-200 border-amber-700/40', description: 'Speed 0; disadvantage on DEX saves; attacks against have advantage.' },
  { id: 'stunned', name: 'Stunned', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', description: 'Incapacitated, can only falter; auto-fails STR/DEX saves; attacks against have advantage.' },
  { id: 'unconscious', name: 'Unconscious', color: 'bg-red-700/20 text-red-200 border-red-700/40', description: 'Incapacitated, drops items, falls prone; auto-fails STR/DEX saves.' },
  { id: 'concentrating', name: 'Concentration', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', description: 'Maintaining a spell effect; requires CON save upon taking damage.' },
  { id: 'dead', name: 'Dead / Down', color: 'bg-neutral-800 text-neutral-400 border-neutral-600', description: 'HP reduced to 0 or killed.' }
];

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  armorClass?: number; // AC - Armour Class (especialmente para inimigos)
  initiative: number;
  initiativeModifier?: number;
  conditions: string[]; // array de IDs de condições
  notes?: string;
  sourceCharacterId?: number; // se veio de um Character existente
  sourceMonsterName?: string; // se veio do Bestiário
  avatarUrl?: string;
}

export interface CombatGroup {
  groupId: string;
  type: CombatantType;
  initiativeRange: { min: number; max: number };
  isSharedTurn: boolean; // Verdadeiro quando 2+ combatentes do mesmo time agem juntos em sequência
  combatants: Combatant[];
}

export interface BattleHistoryItem {
  id: string;
  timestamp: string;
  round: number;
  message: string;
  type?: 'damage' | 'heal' | 'turn' | 'round' | 'status' | 'info';
}

export interface BattleState {
  combatants: Combatant[];
  isActive: boolean;
  round: number;
  currentGroupIndex: number;
  activeCombatantId: string | null;
  history: BattleHistoryItem[];
  lastSaved?: string;
}

export interface SavedEncounter {
  id: string;
  campaignId: number | null;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  combatants: Combatant[];
  round?: number;
}
