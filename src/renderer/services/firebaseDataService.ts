import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';
import { auth } from '../utils/auth';
import { exportToSQLite, importFromSQLite } from '../utils/sqliteParser';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';

export class FirebaseDataService implements IDataService {
  private get db() {
    return getFirestore();
  }

  private get userId(): string {
    if (!auth || !auth.currentUser) {
      throw new Error("User must be logged in to use cloud service.");
    }
    return auth.currentUser.uid;
  }

  // Helper to generate unique numeric ID
  private generateNumericId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const colRef = collection(this.db, 'users', this.userId, 'campaigns');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => doc.data() as Campaign);
  }

  async getCampaign(id: number): Promise<Campaign> {
    const docRef = doc(this.db, 'users', this.userId, 'campaigns', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Campaign with ID ${id} not found.`);
    return snap.data() as Campaign;
  }

  async createCampaign(data: Omit<Campaign, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const campaign: Campaign = { ...data, id };
    const docRef = doc(this.db, 'users', this.userId, 'campaigns', id.toString());
    await setDoc(docRef, campaign);
    return id;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'campaigns', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const existing = snap.data() as Campaign;
    await setDoc(docRef, { ...existing, ...data });
    return true;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'campaigns', id.toString());
    await deleteDoc(docRef);

    // Clean up related data scope-wide
    const cleanup = async (subcol: string) => {
      try {
        const q = query(collection(this.db, 'users', this.userId, subcol), where('campaign_id', '==', id));
        const snap = await getDocs(q);
        const batchPromises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(batchPromises);
      } catch (err) {
        console.error(`[FirebaseDataService] Failed to cleanup subcollection ${subcol}:`, err);
      }
    };

    await Promise.all([
      cleanup('entries'),
      cleanup('characters'),
      cleanup('locations')
    ]);

    return true;
  }

  // Entries
  async getEntries(campaignId: number): Promise<Entry[]> {
    const q = query(
      collection(this.db, 'users', this.userId, 'entries'), 
      where('campaign_id', '==', campaignId)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => doc.data() as Entry);
    // Match SQLite ordering: ORDER BY creation_date DESC
    return results.sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime());
  }

  async getEntry(id: number): Promise<Entry> {
    const docRef = doc(this.db, 'users', this.userId, 'entries', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Entry with ID ${id} not found.`);
    return snap.data() as Entry;
  }

  async createEntry(data: Omit<Entry, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const entry: Entry = { ...data, id };
    const docRef = doc(this.db, 'users', this.userId, 'entries', id.toString());
    await setDoc(docRef, entry);
    return id;
  }

  async updateEntry(id: number, data: Partial<Entry>): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'entries', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const existing = snap.data() as Entry;
    await setDoc(docRef, { ...existing, ...data });
    return true;
  }

  async deleteEntry(id: number): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'entries', id.toString());
    await deleteDoc(docRef);
    return true;
  }

  // Characters
  async getCharacters(campaignId: number): Promise<Character[]> {
    const q = query(collection(this.db, 'users', this.userId, 'characters'), where('campaign_id', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Character);
  }

  async getCharacter(id: number): Promise<Character> {
    const docRef = doc(this.db, 'users', this.userId, 'characters', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Character with ID ${id} not found.`);
    return snap.data() as Character;
  }

  async createCharacter(data: Omit<Character, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const char: Character = { ...data, id };
    const docRef = doc(this.db, 'users', this.userId, 'characters', id.toString());
    await setDoc(docRef, char);
    return id;
  }

  async updateCharacter(id: number, data: Partial<Character>): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'characters', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const existing = snap.data() as Character;
    await setDoc(docRef, { ...existing, ...data });
    return true;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'characters', id.toString());
    await deleteDoc(docRef);
    return true;
  }

  // Locations
  async getLocations(campaignId: number): Promise<Location[]> {
    const q = query(collection(this.db, 'users', this.userId, 'locations'), where('campaign_id', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Location);
  }

  async getLocation(id: number): Promise<Location> {
    const docRef = doc(this.db, 'users', this.userId, 'locations', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Location with ID ${id} not found.`);
    return snap.data() as Location;
  }

  async createLocation(data: Omit<Location, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const loc: Location = { ...data, id };
    const docRef = doc(this.db, 'users', this.userId, 'locations', id.toString());
    await setDoc(docRef, loc);
    return id;
  }

  async updateLocation(id: number, data: Partial<Location>): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'locations', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const existing = snap.data() as Location;
    await setDoc(docRef, { ...existing, ...data });
    return true;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const docRef = doc(this.db, 'users', this.userId, 'locations', id.toString());
    await deleteDoc(docRef);
    return true;
  }

  // Helper to fetch all data from Firestore for backups
  private async getAllUserData() {
    const campaignsRef = collection(this.db, 'users', this.userId, 'campaigns');
    const charactersRef = collection(this.db, 'users', this.userId, 'characters');
    const locationsRef = collection(this.db, 'users', this.userId, 'locations');
    const entriesRef = collection(this.db, 'users', this.userId, 'entries');
    
    const [campsSnap, charsSnap, locsSnap, entriesSnap] = await Promise.all([
      getDocs(campaignsRef),
      getDocs(charactersRef),
      getDocs(locationsRef),
      getDocs(entriesRef)
    ]);
    
    const campaigns = campsSnap.docs.map(doc => doc.data());
    const characters = charsSnap.docs.map(doc => doc.data());
    const locations = locsSnap.docs.map(doc => doc.data());
    const entries = entriesSnap.docs.map(doc => doc.data());
    
    return { campaigns, characters, locations, entries };
  }

  private async uploadImportedData(data: { campaigns: any[], characters: any[], locations: any[], entries: any[] }): Promise<boolean> {
    if (!data.campaigns || data.campaigns.length === 0) {
      alert("Nenhuma campanha encontrada no backup.");
      return false;
    }
    
    // Map of old campaign ID -> new campaign ID
    const campaignIdMap = new Map<number, number>();
    
    for (const camp of data.campaigns) {
      // Create campaign in Firestore
      const newCampId = await this.createCampaign({
        name: camp.name,
        genre: camp.genre ?? null,
        system: camp.system ?? null
      });
      campaignIdMap.set(camp.id, newCampId);
    }
    
    // Upload characters
    if (data.characters) {
      for (const char of data.characters) {
        const newCampId = campaignIdMap.get(char.campaign_id);
        if (newCampId !== undefined) {
          await this.createCharacter({
            campaign_id: newCampId,
            name: char.name,
            race: char.race ?? null,
            status: char.status ?? null,
            age: char.age ?? null,
            faction: char.faction ?? null,
            lore: char.lore ?? null,
            bonds: char.bonds ?? null,
            personal_notes: char.personal_notes ?? null,
            image_url: char.image_url ?? null
          });
        }
      }
    }
    
    // Upload locations
    if (data.locations) {
      for (const loc of data.locations) {
        const newCampId = campaignIdMap.get(loc.campaign_id);
        if (newCampId !== undefined) {
          await this.createLocation({
            campaign_id: newCampId,
            name: loc.name,
            region: loc.region ?? null,
            type: loc.type ?? null,
            description: loc.description ?? null,
            lore: loc.lore ?? null,
            present_npcs: loc.present_npcs ?? null,
            atmosphere: loc.atmosphere ?? null,
            image_url: loc.image_url ?? null
          });
        }
      }
    }
    
    // Upload entries
    if (data.entries) {
      for (const entry of data.entries) {
        const newCampId = campaignIdMap.get(entry.campaign_id);
        if (newCampId !== undefined) {
          await this.createEntry({
            campaign_id: newCampId,
            title: entry.title,
            content: entry.content ?? null,
            creation_date: entry.creation_date || new Date().toISOString()
          });
        }
      }
    }
    
    return true;
  }

  // Backups
  async exportDatabase(): Promise<Uint8Array | boolean> {
    const data = await this.getAllUserData();
    if (typeof window !== 'undefined' && (window as any).api && (window as any).api.exportCloudDatabase) {
      return (window as any).api.exportCloudDatabase(data);
    } else {
      return exportToSQLite(data);
    }
  }

  async importDatabase(data?: Uint8Array): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).api && (window as any).api.importCloudDatabase) {
      const importedData = await (window as any).api.importCloudDatabase();
      if (!importedData) return false;
      return this.uploadImportedData(importedData);
    } else {
      if (!data) return false;
      const importedData = await importFromSQLite(data);
      return this.uploadImportedData(importedData);
    }
  }
}
