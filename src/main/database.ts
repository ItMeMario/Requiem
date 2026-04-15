const Database = require('better-sqlite3');
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = !app.isPackaged;

// Get the appropriate database path based on the environment
let dbDir = app.getPath('userData');

if (isDev) {
  dbDir = path.join(process.cwd(), 'dev-data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export const dbPath = path.join(dbDir, 'requiem.db');

export const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

export function initDb() {
  const createCampaignsTable = `
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      genre TEXT,
      system TEXT
    );
  `;

  const createEntriesTable = `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      creation_date TEXT NOT NULL,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
    );
  `;

  const createCharactersTable = `
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
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
    );
  `;

  const createLocationsTable = `
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
  `;

  db.exec(createCampaignsTable);
  db.exec(createEntriesTable);
  db.exec(createCharactersTable);
  db.exec(createLocationsTable);
}
