import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';

export class ElectronDataService implements IDataService {
  private get api() {
    return (window as any).api;
  }

  private listeners = new Set<() => void>();

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error('[ElectronDataService] Listener error:', err);
      }
    });
  }

  // Campaigns
  getCampaigns(): Promise<Campaign[]> {
    return this.api.getCampaigns();
  }
  getCampaign(id: number): Promise<Campaign> {
    return this.api.getCampaign(id);
  }
  async createCampaign(data: Omit<Campaign, 'id'>): Promise<number> {
    const res = await this.api.createCampaign(data);
    this.notifyListeners();
    return res;
  }
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean> {
    const res = await this.api.updateCampaign(id, data);
    this.notifyListeners();
    return res;
  }
  async deleteCampaign(id: number): Promise<boolean> {
    const res = await this.api.deleteCampaign(id);
    this.notifyListeners();
    return res;
  }

  // Entries
  getEntries(campaignId: number): Promise<Entry[]> {
    return this.api.getEntries(campaignId);
  }
  getEntry(id: number): Promise<Entry> {
    return this.api.getEntry(id);
  }
  async createEntry(data: Omit<Entry, 'id'>): Promise<number> {
    const res = await this.api.createEntry(data);
    this.notifyListeners();
    return res;
  }
  async updateEntry(id: number, data: Partial<Entry>): Promise<boolean> {
    const res = await this.api.updateEntry(id, data);
    this.notifyListeners();
    return res;
  }
  async deleteEntry(id: number): Promise<boolean> {
    const res = await this.api.deleteEntry(id);
    this.notifyListeners();
    return res;
  }

  // Characters
  getCharacters(campaignId: number): Promise<Character[]> {
    return this.api.getCharacters(campaignId);
  }
  getCharacter(id: number): Promise<Character> {
    return this.api.getCharacter(id);
  }
  async createCharacter(data: Omit<Character, 'id'>): Promise<number> {
    const res = await this.api.createCharacter(data);
    this.notifyListeners();
    return res;
  }
  async updateCharacter(id: number, data: Partial<Character>): Promise<boolean> {
    const res = await this.api.updateCharacter(id, data);
    this.notifyListeners();
    return res;
  }
  async deleteCharacter(id: number): Promise<boolean> {
    const res = await this.api.deleteCharacter(id);
    this.notifyListeners();
    return res;
  }

  // Locations
  getLocations(campaignId: number): Promise<Location[]> {
    return this.api.getLocations(campaignId);
  }
  getLocation(id: number): Promise<Location> {
    return this.api.getLocation(id);
  }
  async createLocation(data: Omit<Location, 'id'>): Promise<number> {
    const res = await this.api.createLocation(data);
    this.notifyListeners();
    return res;
  }
  async updateLocation(id: number, data: Partial<Location>): Promise<boolean> {
    const res = await this.api.updateLocation(id, data);
    this.notifyListeners();
    return res;
  }
  async deleteLocation(id: number): Promise<boolean> {
    const res = await this.api.deleteLocation(id);
    this.notifyListeners();
    return res;
  }

  // Backups
  exportDatabase(): Promise<Uint8Array | boolean> {
    return this.api.exportDatabase();
  }
  async importDatabase(data?: Uint8Array): Promise<boolean> {
    const res = await this.api.importDatabase(data);
    this.notifyListeners();
    return res;
  }

  // Collaborators
  async getCollaborators(campaignId: number): Promise<any[]> {
    return [];
  }
  async addCollaborator(campaignId: number, email: string): Promise<boolean> {
    return false;
  }
  async removeCollaborator(campaignId: number, uid: string): Promise<boolean> {
    return false;
  }

  // Real-time Subscriptions
  subscribeCampaigns(callback: (campaigns: Campaign[]) => void, onError?: (error: Error) => void): () => void {
    const handler = () => {
      this.getCampaigns().then(callback).catch(err => {
        console.error('[ElectronDataService] error in campaigns subscription:', err);
        if (onError) onError(err);
      });
    };
    this.listeners.add(handler);
    handler(); // Initial load
    return () => {
      this.listeners.delete(handler);
    };
  }

  subscribeCharacters(campaignId: number, callback: (chars: Character[]) => void, onError?: (error: Error) => void): () => void {
    const handler = () => {
      this.getCharacters(campaignId).then(callback).catch(err => {
        console.error('[ElectronDataService] error in characters subscription:', err);
        if (onError) onError(err);
      });
    };
    this.listeners.add(handler);
    handler(); // Initial load
    return () => {
      this.listeners.delete(handler);
    };
  }

  subscribeLocations(campaignId: number, callback: (locs: Location[]) => void, onError?: (error: Error) => void): () => void {
    const handler = () => {
      this.getLocations(campaignId).then(callback).catch(err => {
        console.error('[ElectronDataService] error in locations subscription:', err);
        if (onError) onError(err);
      });
    };
    this.listeners.add(handler);
    handler(); // Initial load
    return () => {
      this.listeners.delete(handler);
    };
  }

  subscribeEntries(campaignId: number, callback: (entries: Entry[]) => void, onError?: (error: Error) => void): () => void {
    const handler = () => {
      this.getEntries(campaignId).then(callback).catch(err => {
        console.error('[ElectronDataService] error in entries subscription:', err);
        if (onError) onError(err);
      });
    };
    this.listeners.add(handler);
    handler(); // Initial load
    return () => {
      this.listeners.delete(handler);
    };
  }
}
