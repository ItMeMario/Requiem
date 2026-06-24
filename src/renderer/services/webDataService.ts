import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { openDB, IDBPDatabase } from 'idb';
import { IDataService } from '../../shared/dataService';
import { Campaign, Entry, Character, Location } from '../../shared/types';

const DB_NAME = 'requiem-pwa-db';
const STORE_NAME = 'sqlite-store';
const DB_KEY = 'sqlite-binary';

export class WebDataService implements IDataService {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private idbConn: IDBPDatabase | null = null;
  private initPromise: Promise<void>;
  public initError: string | null = null;
  private dirty: boolean = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initPromise = this.init();
    this.setupLifecycleListeners();
  }

  /**
   * Register lifecycle event listeners to ensure data is persisted
   * when the app is backgrounded or closed on Android/mobile.
   * 
   * On Android WebView (Capacitor), the OS can kill the process at any time
   * after the page becomes hidden. We MUST flush to IndexedDB at that point.
   */
  private setupLifecycleListeners() {
    // visibilitychange fires when user switches apps or locks screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushToIndexedDB();
      }
    });

    // pagehide fires when the page is being unloaded (more reliable on some Android versions)
    window.addEventListener('pagehide', () => {
      this.flushToIndexedDB();
    });

    // beforeunload as additional safety net
    window.addEventListener('beforeunload', () => {
      this.flushToIndexedDB();
    });
  }

  /**
   * Synchronous-style flush: we can't truly await in pagehide/visibilitychange,
   * so we start the save and hope the microtask completes before kill.
   * This is the best we can do given browser constraints.
   */
  private flushToIndexedDB() {
    if (!this.dirty || !this.db || !this.idbConn) return;
    try {
      const data = this.db.export();
      // Fire and forget — the browser will try to complete this before killing the process
      this.idbConn.put(STORE_NAME, data, DB_KEY).then(() => {
        this.dirty = false;
      }).catch((err) => {
        console.error('[Requiem DB] flush failed:', err);
      });
    } catch (err) {
      console.error('[Requiem DB] export failed during flush:', err);
    }
  }

  private async init() {
    try {
      // Fetch the WASM binary manually to avoid sql.js internal loading issues on Android WebView
      const wasmResponse = await fetch(sqlWasmUrl);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText} (URL: ${sqlWasmUrl})`);
      }
      const wasmBinary = await wasmResponse.arrayBuffer();

      this.SQL = await initSqlJs({
        wasmBinary: wasmBinary
      });
    } catch (e: any) {
      this.initError = `sql.js init failed: ${e?.message || e}`;
      console.error('[Requiem DB]', this.initError);
      throw e;
    }

    this.idbConn = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });

    const savedData = await this.idbConn.get(STORE_NAME, DB_KEY);
    if (savedData) {
      this.db = new this.SQL.Database(savedData);
    } else {
      this.db = new this.SQL.Database();
    }
    await this.runInitialMigrations();
  }

  private async runInitialMigrations() {
    if (!this.db) return;

    this.db.run("PRAGMA foreign_keys = ON;");

    this.db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        genre TEXT,
        system TEXT
      );
    `);

    // Migrations for existing users (adding columns if they don't exist)
    try { this.db.run("ALTER TABLE campaigns ADD COLUMN genre TEXT;"); } catch (e) {}
    try { this.db.run("ALTER TABLE campaigns ADD COLUMN system TEXT;"); } catch (e) {}

    this.db.run(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        creation_date TEXT NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        race TEXT,
        status TEXT,
        age TEXT,
        faction TEXT,
        lore TEXT,
        bonds TEXT,
        personal_notes TEXT,
        image_url TEXT,
        attachments TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
      );
    `);

    try { this.db.run("ALTER TABLE characters ADD COLUMN image_url TEXT;"); } catch (e) {}
    try { this.db.run("ALTER TABLE characters ADD COLUMN attachments TEXT;"); } catch (e) {}

    this.db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        region TEXT,
        type TEXT,
        description TEXT,
        lore TEXT,
        present_npcs TEXT,
        atmosphere TEXT,
        image_url TEXT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
      );
    `);

    try { this.db.run("ALTER TABLE locations ADD COLUMN image_url TEXT;"); } catch (e) {}

    await this.saveToIndexedDB();
  }

  private async saveToIndexedDB() {
    if (!this.db || !this.idbConn) return;
    try {
      const data = this.db.export();
      await this.idbConn.put(STORE_NAME, data, DB_KEY);
      this.dirty = false;
    } catch (err) {
      console.error('[Requiem DB] saveToIndexedDB failed:', err);
      // Mark as dirty so lifecycle listeners will retry
      this.dirty = true;
    }
  }

  /**
   * Schedule a debounced save — if multiple operations happen quickly,
   * we only save once at the end. This is a safety net on top of
   * the immediate save in execute().
   */
  private scheduleSave() {
    this.dirty = true;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => {
      this.saveToIndexedDB();
    }, 500);
  }

  private async getDb(): Promise<Database> {
    await this.initPromise;
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  private async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const db = await this.getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    stmt.free();
    return results;
  }

  private async execute(sql: string, params: any[] = []): Promise<number | null> {
    const db = await this.getDb();
    db.run(sql, params);
    
    // Get last_insert_rowid BEFORE saving — so the snapshot includes
    // the same state that was just written
    const res = db.exec("SELECT last_insert_rowid() as id");
    let lastId: number | null = null;
    if (res && res[0] && res[0].values && res[0].values[0]) {
       lastId = res[0].values[0][0] as number;
    }
    
    // Immediately persist to IndexedDB
    await this.saveToIndexedDB();
    
    // Also schedule a debounced backup save as safety net
    this.scheduleSave();
    
    return lastId;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return this.query<Campaign>('SELECT * FROM campaigns');
  }
  async getCampaign(id: number): Promise<Campaign> {
    const res = await this.query<Campaign>('SELECT * FROM campaigns WHERE id = ?', [id]);
    return res[0];
  }
  async createCampaign(data: Omit<Campaign, 'id'>): Promise<number> {
    const id = await this.execute('INSERT INTO campaigns (name, genre, system) VALUES (?, ?, ?)', [data.name, data.genre ?? null, data.system ?? null]);
    return id || 0;
  }
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<boolean> {
    await this.execute('UPDATE campaigns SET name = ?, genre = ?, system = ? WHERE id = ?', [data.name, data.genre ?? null, data.system ?? null, id]);
    return true;
  }
  async deleteCampaign(id: number): Promise<boolean> {
    await this.execute('DELETE FROM campaigns WHERE id = ?', [id]);
    return true;
  }

  // Entries
  async getEntries(campaignId: number): Promise<Entry[]> {
    return this.query<Entry>('SELECT * FROM entries WHERE campaign_id = ? ORDER BY creation_date DESC', [campaignId]);
  }
  async getEntry(id: number): Promise<Entry> {
    const res = await this.query<Entry>('SELECT * FROM entries WHERE id = ?', [id]);
    return res[0];
  }
  async createEntry(data: Omit<Entry, 'id'>): Promise<number> {
    const id = await this.execute('INSERT INTO entries (campaign_id, title, content, creation_date) VALUES (?, ?, ?, ?)', [data.campaign_id, data.title, data.content ?? null, data.creation_date]);
    return id || 0;
  }
  async updateEntry(id: number, data: Partial<Entry>): Promise<boolean> {
    await this.execute('UPDATE entries SET title = ?, content = ? WHERE id = ?', [data.title, data.content ?? null, id]);
    return true;
  }
  async deleteEntry(id: number): Promise<boolean> {
    await this.execute('DELETE FROM entries WHERE id = ?', [id]);
    return true;
  }

  // Characters
  async getCharacters(campaignId: number): Promise<Character[]> {
    const rows = await this.query<any>('SELECT * FROM characters WHERE campaign_id = ?', [campaignId]);
    return rows.map(row => ({
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : []
    }));
  }
  async getCharacter(id: number): Promise<Character> {
    const res = await this.query<any>('SELECT * FROM characters WHERE id = ?', [id]);
    const row = res[0];
    if (!row) return row;
    return {
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : []
    };
  }
  async createCharacter(data: Omit<Character, 'id'>): Promise<number> {
    const id = await this.execute(`
      INSERT INTO characters (
        campaign_id, name, race, status, age, faction, lore, bonds, personal_notes, image_url, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.campaign_id,
      data.name,
      data.race ?? null,
      data.status ?? null,
      data.age ?? null,
      data.faction ?? null,
      data.lore ?? null,
      data.bonds ?? null,
      data.personal_notes ?? null,
      data.image_url ?? null,
      data.attachments ? JSON.stringify(data.attachments) : null
    ]);
    return id || 0;
  }
  async updateCharacter(id: number, data: Partial<Character>): Promise<boolean> {
    await this.execute(`
      UPDATE characters SET 
        name = ?, race = ?, status = ?, age = ?, 
        faction = ?, lore = ?, bonds = ?, personal_notes = ?, image_url = ?, attachments = ?
      WHERE id = ?
    `, [
      data.name,
      data.race ?? null,
      data.status ?? null,
      data.age ?? null,
      data.faction ?? null,
      data.lore ?? null,
      data.bonds ?? null,
      data.personal_notes ?? null,
      data.image_url ?? null,
      data.attachments ? JSON.stringify(data.attachments) : null,
      id
    ]);
    return true;
  }
  async deleteCharacter(id: number): Promise<boolean> {
    await this.execute('DELETE FROM characters WHERE id = ?', [id]);
    return true;
  }

  // Locations
  async getLocations(campaignId: number): Promise<Location[]> {
    return this.query<Location>('SELECT * FROM locations WHERE campaign_id = ?', [campaignId]);
  }
  async getLocation(id: number): Promise<Location> {
    const res = await this.query<Location>('SELECT * FROM locations WHERE id = ?', [id]);
    return res[0];
  }
  async createLocation(data: Omit<Location, 'id'>): Promise<number> {
    const id = await this.execute(`
      INSERT INTO locations (
        campaign_id, name, region, type, description, lore, present_npcs, atmosphere, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [data.campaign_id, data.name, data.region ?? null, data.type ?? null, data.description ?? null, data.lore ?? null, data.present_npcs ?? null, data.atmosphere ?? null, data.image_url ?? null]);
    return id || 0;
  }
  async updateLocation(id: number, data: Partial<Location>): Promise<boolean> {
    await this.execute(`
      UPDATE locations SET 
        name = ?, region = ?, type = ?, description = ?, 
        lore = ?, present_npcs = ?, atmosphere = ?, image_url = ?
      WHERE id = ?
    `, [data.name, data.region ?? null, data.type ?? null, data.description ?? null, data.lore ?? null, data.present_npcs ?? null, data.atmosphere ?? null, data.image_url ?? null, id]);
    return true;
  }
  async deleteLocation(id: number): Promise<boolean> {
    await this.execute('DELETE FROM locations WHERE id = ?', [id]);
    return true;
  }

  // Backups
  async exportDatabase(): Promise<Uint8Array | boolean> {
    const db = await this.getDb();
    return db.export();
  }
  
  async importDatabase(data?: Uint8Array): Promise<boolean> {
    if (!data) return false;
    await this.initPromise;
    if (!this.SQL) return false;
    this.db = new this.SQL.Database(data);
    await this.saveToIndexedDB();
    return true;
  }
}
