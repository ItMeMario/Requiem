import { Campaign, Entry, Character, Location } from './types';

export interface IDataService {
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign>;
  createCampaign(data: Omit<Campaign, 'id'>): Promise<number>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean>;
  deleteCampaign(id: number): Promise<boolean>;

  // Entries
  getEntries(campaignId: number): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry>;
  createEntry(data: Omit<Entry, 'id'>): Promise<number>;
  updateEntry(id: number, data: Partial<Entry>): Promise<boolean>;
  deleteEntry(id: number): Promise<boolean>;

  // Characters
  getCharacters(campaignId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character>;
  createCharacter(data: Omit<Character, 'id'>): Promise<number>;
  updateCharacter(id: number, data: Partial<Character>): Promise<boolean>;
  deleteCharacter(id: number): Promise<boolean>;

  // Locations
  getLocations(campaignId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location>;
  createLocation(data: Omit<Location, 'id'>): Promise<number>;
  updateLocation(id: number, data: Partial<Location>): Promise<boolean>;
  deleteLocation(id: number): Promise<boolean>;

  // Backups
  exportDatabase(): Promise<Uint8Array | boolean>;
  importDatabase(data?: Uint8Array): Promise<boolean>;

  // Collaborators
  getCollaborators(campaignId: number): Promise<any[]>;
  addCollaborator(campaignId: number, email: string): Promise<boolean>;
  removeCollaborator(campaignId: number, uid: string): Promise<boolean>;
}
