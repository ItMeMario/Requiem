import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';
import { auth } from '../utils/auth';
import { exportToSQLite, importFromSQLite } from '../utils/sqliteParser';
import { compressBase64Image } from '../utils/imageCompressor';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  or,
  collectionGroup
} from 'firebase/firestore';

export class FirebaseDataService implements IDataService {
  private characterCampaignMap = new Map<number, number>();
  private locationCampaignMap = new Map<number, number>();
  private entryCampaignMap = new Map<number, number>();

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

  // Helper to find a document ref in a collection group by numeric id
  private async findDocRef(colName: string, id: number) {
    const q = query(collectionGroup(this.db, colName), where('id', '==', Number(id)));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error(`Document in ${colName} with ID ${id} not found.`);
    }
    return snap.docs[0].ref;
  }

  private async getCharacterDocRef(id: number, campaignId?: number): Promise<any> {
    const campId = campaignId || this.characterCampaignMap.get(id);
    if (campId) {
      return doc(this.db, 'campaigns', campId.toString(), 'characters', id.toString());
    }
    return this.findDocRef('characters', id);
  }

  private async getLocationDocRef(id: number, campaignId?: number): Promise<any> {
    const campId = campaignId || this.locationCampaignMap.get(id);
    if (campId) {
      return doc(this.db, 'campaigns', campId.toString(), 'locations', id.toString());
    }
    return this.findDocRef('locations', id);
  }

  private async getEntryDocRef(id: number, campaignId?: number): Promise<any> {
    const campId = campaignId || this.entryCampaignMap.get(id);
    if (campId) {
      return doc(this.db, 'campaigns', campId.toString(), 'entries', id.toString());
    }
    return this.findDocRef('entries', id);
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const colRef = collection(this.db, 'campaigns');
    const q = query(
      colRef,
      or(
        where('ownerId', '==', this.userId),
        where('collaborators', 'array-contains', this.userId)
      )
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Campaign;
      return {
        ...data,
        id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id)
      };
    });
  }

  async getCampaign(id: number): Promise<Campaign> {
    const docRef = doc(this.db, 'campaigns', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error(`Campaign with ID ${id} not found.`);
    const data = snap.data() as Campaign;
    return {
      ...data,
      id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(snap.id)
    };
  }

  async createCampaign(data: Omit<Campaign, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const campaign: Campaign = { 
      ...data, 
      id,
      ownerId: this.userId,
      collaborators: data.collaborators || []
    };
    const docRef = doc(this.db, 'campaigns', id.toString());
    await setDoc(docRef, campaign);
    return id;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean> {
    const docRef = doc(this.db, 'campaigns', id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const existing = snap.data() as Campaign;
    await setDoc(docRef, { ...existing, ...data });
    return true;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const numericId = Number(id);

    // 1. Delete campaign document directly
    const docRef = doc(this.db, 'campaigns', numericId.toString());
    await deleteDoc(docRef);

    // 2. Clean up related subcollection documents (entries, characters, locations)
    const cleanup = async (subcol: string) => {
      try {
        const colRef = collection(this.db, 'campaigns', numericId.toString(), subcol);
        const snap = await getDocs(colRef);
        const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error(`[FirebaseDataService] Failed to cleanup subcollection ${subcol}:`, err);
      }
    };

    await Promise.all([
      cleanup('entries'),
      cleanup('characters'),
      cleanup('locations')
    ]);

    // 3. Delete from the local database
    try {
      if (typeof window !== 'undefined' && (window as any).api) {
        await (window as any).api.deleteCampaign(numericId);
      } else {
        const { WebDataService } = await import('./webDataService');
        const localService = new WebDataService();
        await localService.deleteCampaign(numericId);
      }
    } catch (localErr) {
      console.warn('[FirebaseDataService] Failed to delete campaign from local storage:', localErr);
    }

    return true;
  }

  // Entries
  async getEntries(campaignId: number): Promise<Entry[]> {
    const campaignDoc = await getDoc(doc(this.db, 'campaigns', campaignId.toString()));
    if (!campaignDoc.exists()) return [];
    const campaign = campaignDoc.data() as Campaign;
    const isOwner = campaign.ownerId === this.userId;

    const colRef = collection(this.db, 'campaigns', campaignId.toString(), 'entries');
    let q;
    if (isOwner) {
      q = query(colRef);
    } else {
      q = query(
        colRef,
        or(
          where('shared', '==', true),
          where('authorId', '==', this.userId)
        )
      );
    }

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
      const data = doc.data() as Entry;
      const entryId = data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id);
      this.entryCampaignMap.set(entryId, campaignId);
      return {
        ...data,
        id: entryId
      };
    });
    return results.sort((a, b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime());
  }

  async getEntry(id: number): Promise<Entry> {
    const ref = await this.getEntryDocRef(id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Entry with ID ${id} not found.`);
    const data = snap.data() as Entry;
    return {
      ...data,
      id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(snap.id)
    };
  }

  async createEntry(data: Omit<Entry, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const userName = auth?.currentUser?.displayName || auth?.currentUser?.email || '';
    const entry: Entry = { 
      ...data, 
      id,
      authorId: this.userId,
      authorName: userName,
      shared: data.shared !== false
    };
    const docRef = doc(this.db, 'campaigns', data.campaign_id.toString(), 'entries', id.toString());
    await setDoc(docRef, entry);
    this.entryCampaignMap.set(id, data.campaign_id);
    return id;
  }

  async updateEntry(id: number, data: Partial<Entry>): Promise<boolean> {
    const ref = await this.getEntryDocRef(id, data.campaign_id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const existing = snap.data() as Entry;
    await setDoc(ref, { ...existing, ...data });
    return true;
  }

  async deleteEntry(id: number): Promise<boolean> {
    const ref = await this.getEntryDocRef(id);
    await deleteDoc(ref);
    return true;
  }

  // Characters
  async getCharacters(campaignId: number): Promise<Character[]> {
    const campaignDoc = await getDoc(doc(this.db, 'campaigns', campaignId.toString()));
    if (!campaignDoc.exists()) return [];
    const campaign = campaignDoc.data() as Campaign;
    const isOwner = campaign.ownerId === this.userId;

    const colRef = collection(this.db, 'campaigns', campaignId.toString(), 'characters');
    let q;
    if (isOwner) {
      q = query(colRef);
    } else {
      q = query(
        colRef,
        or(
          where('shared', '==', true),
          where('authorId', '==', this.userId)
        )
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Character;
      const charId = data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id);
      this.characterCampaignMap.set(charId, campaignId);
      return {
        ...data,
        attachments: data.attachments || [],
        id: charId
      };
    });
  }

  async getCharacter(id: number): Promise<Character> {
    const ref = await this.getCharacterDocRef(id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Character with ID ${id} not found.`);
    const data = snap.data() as Character;
    return {
      ...data,
      attachments: data.attachments || [],
      id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(snap.id)
    };
  }

  async createCharacter(data: Omit<Character, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const userName = auth?.currentUser?.displayName || auth?.currentUser?.email || '';
    const char: Character = { 
      ...data, 
      id,
      authorId: this.userId,
      authorName: userName,
      shared: data.shared !== false
    };
    const docRef = doc(this.db, 'campaigns', data.campaign_id.toString(), 'characters', id.toString());
    await setDoc(docRef, char);
    this.characterCampaignMap.set(id, data.campaign_id);
    return id;
  }

  async updateCharacter(id: number, data: Partial<Character>): Promise<boolean> {
    const ref = await this.getCharacterDocRef(id, data.campaign_id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const existing = snap.data() as Character;
    await setDoc(ref, { ...existing, ...data });
    return true;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const ref = await this.getCharacterDocRef(id);
    await deleteDoc(ref);
    return true;
  }

  // Locations
  async getLocations(campaignId: number): Promise<Location[]> {
    const campaignDoc = await getDoc(doc(this.db, 'campaigns', campaignId.toString()));
    if (!campaignDoc.exists()) return [];
    const campaign = campaignDoc.data() as Campaign;
    const isOwner = campaign.ownerId === this.userId;

    const colRef = collection(this.db, 'campaigns', campaignId.toString(), 'locations');
    let q;
    if (isOwner) {
      q = query(colRef);
    } else {
      q = query(
        colRef,
        or(
          where('shared', '==', true),
          where('authorId', '==', this.userId)
        )
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Location;
      const locId = data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id);
      this.locationCampaignMap.set(locId, campaignId);
      return {
        ...data,
        id: locId
      };
    });
  }

  async getLocation(id: number): Promise<Location> {
    const ref = await this.getLocationDocRef(id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Location with ID ${id} not found.`);
    const data = snap.data() as Location;
    return {
      ...data,
      id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(snap.id)
    };
  }

  async createLocation(data: Omit<Location, 'id'>): Promise<number> {
    const id = this.generateNumericId();
    const userName = auth?.currentUser?.displayName || auth?.currentUser?.email || '';
    const loc: Location = { 
      ...data, 
      id,
      authorId: this.userId,
      authorName: userName,
      shared: data.shared !== false
    };
    const docRef = doc(this.db, 'campaigns', data.campaign_id.toString(), 'locations', id.toString());
    await setDoc(docRef, loc);
    this.locationCampaignMap.set(id, data.campaign_id);
    return id;
  }

  async updateLocation(id: number, data: Partial<Location>): Promise<boolean> {
    const ref = await this.getLocationDocRef(id, data.campaign_id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const existing = snap.data() as Location;
    await setDoc(ref, { ...existing, ...data });
    return true;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const ref = await this.getLocationDocRef(id);
    await deleteDoc(ref);
    return true;
  }

  // Collaborators
  async getCollaborators(campaignId: number): Promise<any[]> {
    const campaignDoc = await getDoc(doc(this.db, 'campaigns', campaignId.toString()));
    if (!campaignDoc.exists()) return [];
    const campaign = campaignDoc.data() as Campaign;
    const collaboratorUids = campaign.collaborators || [];
    
    const profiles = await Promise.all(
      collaboratorUids.map(async (uid) => {
        const userSnap = await getDoc(doc(this.db, 'users', uid));
        if (userSnap.exists()) {
          return { uid, ...userSnap.data() };
        }
        return { uid, email: 'Desconhecido', displayName: 'Jogador Desconhecido' };
      })
    );
    return profiles;
  }

  async addCollaborator(campaignId: number, email: string): Promise<boolean> {
    const targetEmail = email.trim().toLowerCase();
    const q = query(collection(this.db, 'users'), where('email', '==', targetEmail));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Jogador não encontrado com este e-mail.');
    }
    const targetUserUid = snap.docs[0].id;
    
    const campaignRef = doc(this.db, 'campaigns', campaignId.toString());
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) return false;
    
    const campaign = campaignSnap.data() as Campaign;
    const collaborators = campaign.collaborators || [];
    
    if (collaborators.includes(targetUserUid)) {
      throw new Error('Jogador já é um colaborador nesta campanha.');
    }
    if (campaign.ownerId === targetUserUid) {
      throw new Error('Você não pode adicionar o próprio mestre como colaborador.');
    }
    
    await setDoc(campaignRef, {
      collaborators: [...collaborators, targetUserUid]
    }, { merge: true });
    
    return true;
  }

  async removeCollaborator(campaignId: number, uid: string): Promise<boolean> {
    const campaignRef = doc(this.db, 'campaigns', campaignId.toString());
    const campaignSnap = await getDoc(campaignRef);
    if (!campaignSnap.exists()) return false;
    
    const campaign = campaignSnap.data() as Campaign;
    const collaborators = campaign.collaborators || [];
    
    await setDoc(campaignRef, {
      collaborators: collaborators.filter(id => id !== uid)
    }, { merge: true });
    
    return true;
  }

  // Backup Data Helper
  private async getAllUserData() {
    const campaignsRef = collection(this.db, 'campaigns');
    const qCamps = query(campaignsRef, where('ownerId', '==', this.userId));
    const campsSnap = await getDocs(qCamps);
    
    const campaigns = campsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id)
      };
    });
    
    const characters: any[] = [];
    const locations: any[] = [];
    const entries: any[] = [];
    
    await Promise.all(campaigns.map(async (camp) => {
      const charsRef = collection(this.db, 'campaigns', camp.id.toString(), 'characters');
      const locsRef = collection(this.db, 'campaigns', camp.id.toString(), 'locations');
      const entriesRef = collection(this.db, 'campaigns', camp.id.toString(), 'entries');
      
      const [charsSnap, locsSnap, entriesSnap] = await Promise.all([
        getDocs(charsRef),
        getDocs(locsRef),
        getDocs(entriesRef)
      ]);
      
      charsSnap.docs.forEach(doc => {
        const data = doc.data();
        characters.push({
          ...data,
          id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id)
        });
      });
      
      locsSnap.docs.forEach(doc => {
        const data = doc.data();
        locations.push({
          ...data,
          id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id)
        });
      });
      
      entriesSnap.docs.forEach(doc => {
        const data = doc.data();
        entries.push({
          ...data,
          id: data.id !== undefined && data.id !== null ? Number(data.id) : Number(doc.id)
        });
      });
    }));
    
    return { campaigns, characters, locations, entries };
  }

  private async uploadImportedData(data: { campaigns: any[], characters: any[], locations: any[], entries: any[] }): Promise<boolean> {
    if (!data.campaigns || data.campaigns.length === 0) {
      alert("Nenhuma campanha encontrada no backup.");
      return false;
    }
    
    const campaignIdMap = new Map<number, number>();
    
    for (const camp of data.campaigns) {
      const newCampId = await this.createCampaign({
        name: camp.name,
        genre: camp.genre ?? null,
        system: camp.system ?? null
      });
      campaignIdMap.set(camp.id, newCampId);
    }
    
    if (data.characters) {
      for (const char of data.characters) {
        const newCampId = campaignIdMap.get(char.campaign_id);
        if (newCampId !== undefined) {
          const compressedImg = char.image_url ? await compressBase64Image(char.image_url) : null;
          let parsedAttachments = [];
          if (char.attachments) {
            try {
              parsedAttachments = typeof char.attachments === 'string'
                ? JSON.parse(char.attachments)
                : char.attachments;
            } catch (e) {
              console.error('Error parsing attachments during import:', e);
            }
          }
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
            image_url: compressedImg,
            attachments: parsedAttachments,
            shared: char.shared !== false
          });
        }
      }
    }
    
    if (data.locations) {
      for (const loc of data.locations) {
        const newCampId = campaignIdMap.get(loc.campaign_id);
        if (newCampId !== undefined) {
          const compressedImg = loc.image_url ? await compressBase64Image(loc.image_url) : null;
          await this.createLocation({
            campaign_id: newCampId,
            name: loc.name,
            region: loc.region ?? null,
            type: loc.type ?? null,
            description: loc.description ?? null,
            lore: loc.lore ?? null,
            present_npcs: loc.present_npcs ?? null,
            atmosphere: loc.atmosphere ?? null,
            image_url: compressedImg,
            shared: loc.shared !== false
          });
        }
      }
    }
    
    if (data.entries) {
      for (const entry of data.entries) {
        const newCampId = campaignIdMap.get(entry.campaign_id);
        if (newCampId !== undefined) {
          await this.createEntry({
            campaign_id: newCampId,
            title: entry.title,
            content: entry.content ?? null,
            creation_date: entry.creation_date || new Date().toISOString(),
            shared: entry.shared !== false
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
