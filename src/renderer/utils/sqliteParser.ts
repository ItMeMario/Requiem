import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let SQLPromise: Promise<any> | null = null;

async function getSQL() {
  if (SQLPromise) return SQLPromise;
  
  SQLPromise = (async () => {
    const wasmResponse = await fetch(sqlWasmUrl);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
    }
    const wasmBinary = await wasmResponse.arrayBuffer();
    return initSqlJs({ wasmBinary });
  })();
  
  return SQLPromise;
}

export async function exportToSQLite(data: { campaigns: any[], characters: any[], locations: any[], entries: any[] }): Promise<Uint8Array> {
  const SQL = await getSQL();
  const db = new SQL.Database();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      genre TEXT,
      system TEXT
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      creation_date TEXT NOT NULL
    );
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
      image_url TEXT
    );
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
      image_url TEXT
    );
  `);
  
  // Insert campaigns
  for (const camp of data.campaigns) {
    db.run(
      'INSERT INTO campaigns (id, name, genre, system) VALUES (?, ?, ?, ?)',
      [camp.id, camp.name, camp.genre ?? null, camp.system ?? null]
    );
  }
  
  // Insert entries
  for (const entry of data.entries) {
    db.run(
      'INSERT INTO entries (id, campaign_id, title, content, creation_date) VALUES (?, ?, ?, ?, ?)',
      [entry.id, entry.campaign_id, entry.title, entry.content ?? null, entry.creation_date]
    );
  }
  
  // Insert characters
  for (const char of data.characters) {
    db.run(
      'INSERT INTO characters (id, campaign_id, name, race, status, age, faction, lore, bonds, personal_notes, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        char.id, char.campaign_id, char.name, char.race ?? null, char.status ?? null,
        char.age ?? null, char.faction ?? null, char.lore ?? null, char.bonds ?? null,
        char.personal_notes ?? null, char.image_url ?? null
      ]
    );
  }
  
  // Insert locations
  for (const loc of data.locations) {
    db.run(
      'INSERT INTO locations (id, campaign_id, name, region, type, description, lore, present_npcs, atmosphere, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        loc.id, loc.campaign_id, loc.name, loc.region ?? null, loc.type ?? null,
        loc.description ?? null, loc.lore ?? null, loc.present_npcs ?? null,
        loc.atmosphere ?? null, loc.image_url ?? null
      ]
    );
  }
  
  const exported = db.export();
  db.close();
  return exported;
}

export async function importFromSQLite(fileData: Uint8Array): Promise<{ campaigns: any[], characters: any[], locations: any[], entries: any[] }> {
  const SQL = await getSQL();
  const db = new SQL.Database(fileData);
  
  const getTableRows = (tableName: string) => {
    // Check if table exists
    const checkStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=:name");
    checkStmt.bind({ ':name': tableName });
    const exists = checkStmt.step();
    checkStmt.free();
    if (!exists) return [];
    
    const rows: any[] = [];
    const stmt = db.prepare(`SELECT * FROM ${tableName}`);
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  };
  
  const campaigns = getTableRows('campaigns');
  const entries = getTableRows('entries');
  const characters = getTableRows('characters');
  const locations = getTableRows('locations');
  
  db.close();
  return { campaigns, entries, characters, locations };
}
