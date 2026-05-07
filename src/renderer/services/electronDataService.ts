import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';

export class ElectronDataService implements IDataService {
  private get api() {
    return (window as any).api;
  }

  // Campaigns
  getCampaigns(): Promise<Campaign[]> {
    return this.api.getCampaigns();
  }
  getCampaign(id: number): Promise<Campaign> {
    return this.api.getCampaign(id);
  }
  createCampaign(data: Omit<Campaign, 'id'>): Promise<number> {
    return this.api.createCampaign(data);
  }
  updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean> {
    return this.api.updateCampaign(id, data);
  }
  deleteCampaign(id: number): Promise<boolean> {
    return this.api.deleteCampaign(id);
  }

  // Entries
  getEntries(campaignId: number): Promise<Entry[]> {
    return this.api.getEntries(campaignId);
  }
  getEntry(id: number): Promise<Entry> {
    return this.api.getEntry(id);
  }
  createEntry(data: Omit<Entry, 'id'>): Promise<number> {
    return this.api.createEntry(data);
  }
  updateEntry(id: number, data: Partial<Entry>): Promise<boolean> {
    return this.api.updateEntry(id, data);
  }
  deleteEntry(id: number): Promise<boolean> {
    return this.api.deleteEntry(id);
  }

  // Characters
  getCharacters(campaignId: number): Promise<Character[]> {
    return this.api.getCharacters(campaignId);
  }
  getCharacter(id: number): Promise<Character> {
    return this.api.getCharacter(id);
  }
  createCharacter(data: Omit<Character, 'id'>): Promise<number> {
    return this.api.createCharacter(data);
  }
  updateCharacter(id: number, data: Partial<Character>): Promise<boolean> {
    return this.api.updateCharacter(id, data);
  }
  deleteCharacter(id: number): Promise<boolean> {
    return this.api.deleteCharacter(id);
  }

  // Locations
  getLocations(campaignId: number): Promise<Location[]> {
    return this.api.getLocations(campaignId);
  }
  getLocation(id: number): Promise<Location> {
    return this.api.getLocation(id);
  }
  createLocation(data: Omit<Location, 'id'>): Promise<number> {
    return this.api.createLocation(data);
  }
  updateLocation(id: number, data: Partial<Location>): Promise<boolean> {
    return this.api.updateLocation(id, data);
  }
  deleteLocation(id: number): Promise<boolean> {
    return this.api.deleteLocation(id);
  }

  // Backups
  exportDatabase(): Promise<Uint8Array | boolean> {
    return this.api.exportDatabase();
  }
  importDatabase(data?: Uint8Array): Promise<boolean> {
    return this.api.importDatabase();
  }
}
