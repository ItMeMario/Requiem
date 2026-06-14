import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';
import { auth } from '../utils/auth';
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

  // Backups
  async exportDatabase(): Promise<Uint8Array | boolean> {
    console.warn("[FirebaseDataService] Export database not supported in cloud mode.");
    return false;
  }

  async importDatabase(data?: Uint8Array): Promise<boolean> {
    console.warn("[FirebaseDataService] Import database not supported in cloud mode.");
    return false;
  }
}
