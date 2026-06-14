import { Preferences } from '@capacitor/preferences';

const CACHE: Record<string, string | null> = {};
const KEYS = ['app-theme', 'lastOpenedCampaignId'] as const;

export async function initStorage(): Promise<void> {
  for (const key of KEYS) {
    let val: string | null = null;
    try {
      const res = await Preferences.get({ key });
      val = res.value;
    } catch (e) {
      console.warn(`[Requiem Storage] Failed to read ${key} from Preferences:`, e);
    }

    // Fallback/sync from localStorage if Preferences didn't return anything
    if (val === null) {
      try {
        val = localStorage.getItem(key);
        // If found in localStorage, migrate it to Preferences for future native launches
        if (val !== null) {
          Preferences.set({ key, value: val }).catch(err => {
            console.warn(`[Requiem Storage] Migration of ${key} to Preferences failed:`, err);
          });
        }
      } catch (e) {
        console.warn(`[Requiem Storage] Failed to read ${key} from localStorage:`, e);
      }
    }

    CACHE[key] = val;
  }
}

export const storage = {
  getItem(key: typeof KEYS[number]): string | null {
    if (CACHE[key] !== undefined) {
      return CACHE[key];
    }
    // Safety fallback
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  async setItem(key: typeof KEYS[number], value: string): Promise<void> {
    CACHE[key] = value;

    // Asynchronously save to Preferences
    try {
      await Preferences.set({ key, value });
    } catch (e) {
      console.error(`[Requiem Storage] Failed to set ${key} in Preferences:`, e);
    }

    // Asynchronously save to localStorage
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`[Requiem Storage] Failed to set ${key} in localStorage:`, e);
    }
  }
};
