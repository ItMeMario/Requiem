import { Preferences } from '@capacitor/preferences';
import { BattleState, SavedEncounter, Combatant } from '../types/battle';

const BATTLE_STATE_PREFIX = 'requiem_battle_state_';
const SAVED_ENCOUNTERS_PREFIX = 'requiem_saved_encounters_';

// Cache em memória para resposta imediata
const MEMORY_CACHE: Record<string, string | null> = {};

function getBattleStateKey(campaignId: number | null): string {
  return `${BATTLE_STATE_PREFIX}${campaignId !== null ? campaignId : 'standalone'}`;
}

function getSavedEncountersKey(campaignId: number | null): string {
  return `${SAVED_ENCOUNTERS_PREFIX}${campaignId !== null ? campaignId : 'standalone'}`;
}

/**
 * Lê uma chave com resiliência: tenta Preferences e faz fallback para localStorage
 */
async function getStoredItem(key: string): Promise<string | null> {
  if (MEMORY_CACHE[key] !== undefined && MEMORY_CACHE[key] !== null) {
    return MEMORY_CACHE[key];
  }

  let value: string | null = null;
  try {
    const res = await Preferences.get({ key });
    value = res.value;
  } catch (e) {
    console.warn(`[BattleStorage] Failed to read ${key} from Preferences:`, e);
  }

  if (value === null) {
    try {
      value = localStorage.getItem(key);
      if (value !== null) {
        // Sincroniza de volta para o Preferences nativo
        Preferences.set({ key, value }).catch(err => {
          console.warn(`[BattleStorage] Failed to sync ${key} to Preferences:`, err);
        });
      }
    } catch (e) {
      console.warn(`[BattleStorage] Failed to read ${key} from localStorage:`, e);
    }
  }

  MEMORY_CACHE[key] = value;
  return value;
}

/**
 * Salva simultaneamente no Preferences e no localStorage
 */
async function setStoredItem(key: string, value: string): Promise<void> {
  MEMORY_CACHE[key] = value;

  try {
    await Preferences.set({ key, value });
  } catch (e) {
    console.error(`[BattleStorage] Failed to write ${key} to Preferences:`, e);
  }

  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`[BattleStorage] Failed to write ${key} to localStorage:`, e);
  }
}

/**
 * Remove chave de ambos os armazenamentos
 */
async function removeStoredItem(key: string): Promise<void> {
  delete MEMORY_CACHE[key];

  try {
    await Preferences.remove({ key });
  } catch (e) {
    console.error(`[BattleStorage] Failed to remove ${key} from Preferences:`, e);
  }

  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`[BattleStorage] Failed to remove ${key} from localStorage:`, e);
  }
}

export const battleStorageService = {
  /**
   * Carrega o estado atual da batalha
   */
  async loadBattleState(campaignId: number | null): Promise<BattleState | null> {
    const key = getBattleStateKey(campaignId);
    try {
      const raw = await getStoredItem(key);
      if (!raw) return null;
      const parsed: BattleState = JSON.parse(raw);
      return {
        combatants: parsed.combatants || [],
        isActive: Boolean(parsed.isActive),
        round: typeof parsed.round === 'number' ? parsed.round : 1,
        currentGroupIndex: typeof parsed.currentGroupIndex === 'number' ? parsed.currentGroupIndex : 0,
        activeCombatantId: parsed.activeCombatantId || null,
        history: parsed.history || [],
        lastSaved: parsed.lastSaved || new Date().toISOString()
      };
    } catch (e) {
      console.error(`[BattleStorage] Error loading battle state for key ${key}:`, e);
      return null;
    }
  },

  /**
   * Salva o estado atual da batalha localmente
   */
  async saveBattleState(campaignId: number | null, state: BattleState): Promise<void> {
    const key = getBattleStateKey(campaignId);
    try {
      const payload: BattleState = {
        ...state,
        lastSaved: new Date().toISOString()
      };
      await setStoredItem(key, JSON.stringify(payload));
    } catch (e) {
      console.error(`[BattleStorage] Error saving battle state for key ${key}:`, e);
    }
  },

  /**
   * Limpa o estado da batalha atual
   */
  async clearBattleState(campaignId: number | null): Promise<void> {
    const key = getBattleStateKey(campaignId);
    try {
      await removeStoredItem(key);
    } catch (e) {
      console.error(`[BattleStorage] Error clearing battle state for key ${key}:`, e);
    }
  },

  /**
   * Obtém a lista de encontros pré-montados salvos localmente
   */
  async getSavedEncounters(campaignId: number | null): Promise<SavedEncounter[]> {
    const key = getSavedEncountersKey(campaignId);
    try {
      const raw = await getStoredItem(key);
      if (!raw) return [];
      const list: SavedEncounter[] = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error(`[BattleStorage] Error loading saved encounters for key ${key}:`, e);
      return [];
    }
  },

  /**
   * Salva ou atualiza um encontro pré-montado na biblioteca local
   */
  async saveEncounter(
    campaignId: number | null,
    encounterData: Omit<SavedEncounter, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'> & { id?: string; campaignId?: number | null }
  ): Promise<SavedEncounter> {
    const encounters = await this.getSavedEncounters(campaignId);
    const now = new Date().toISOString();

    let savedItem: SavedEncounter;

    if (encounterData.id) {
      const existingIdx = encounters.findIndex(e => e.id === encounterData.id);
      if (existingIdx >= 0) {
        savedItem = {
          ...encounters[existingIdx],
          ...encounterData,
          id: encounterData.id,
          campaignId,
          updatedAt: now
        };
        encounters[existingIdx] = savedItem;
      } else {
        savedItem = {
          ...encounterData,
          id: encounterData.id,
          campaignId,
          createdAt: now,
          updatedAt: now
        };
        encounters.unshift(savedItem);
      }
    } else {
      savedItem = {
        ...encounterData,
        id: `enc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        campaignId,
        createdAt: now,
        updatedAt: now
      };
      encounters.unshift(savedItem);
    }

    const key = getSavedEncountersKey(campaignId);
    await setStoredItem(key, JSON.stringify(encounters));
    return savedItem;
  },

  /**
   * Remove um encontro salvo da biblioteca local
   */
  async deleteSavedEncounter(campaignId: number | null, encounterId: string): Promise<void> {
    const encounters = await this.getSavedEncounters(campaignId);
    const filtered = encounters.filter(e => e.id !== encounterId);
    const key = getSavedEncountersKey(campaignId);
    await setStoredItem(key, JSON.stringify(filtered));
  },

  /**
   * Exporta estado ou encontro em formato JSON estruturado
   */
  exportToJson(data: BattleState | SavedEncounter | { combatants: Combatant[] }): string {
    const exportData = {
      _app: 'Requiem',
      _type: 'battle_encounter_export',
      _version: '1.0',
      exportedAt: new Date().toISOString(),
      data
    };
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Importa combate ou encontro a partir de string JSON com validação
   */
  importFromJson(jsonStr: string): { combatants: Combatant[]; name?: string; description?: string } | null {
    try {
      const parsed = JSON.parse(jsonStr);
      let payload = parsed;

      if (parsed && typeof parsed === 'object' && parsed._app === 'Requiem' && parsed.data) {
        payload = parsed.data;
      }

      if (Array.isArray(payload.combatants)) {
        return {
          combatants: payload.combatants,
          name: payload.name || undefined,
          description: payload.description || undefined
        };
      } else if (Array.isArray(payload)) {
        // Se for um array puro de combatentes
        return {
          combatants: payload
        };
      }

      return null;
    } catch (e) {
      console.error('[BattleStorage] Failed to parse JSON import:', e);
      return null;
    }
  }
};
