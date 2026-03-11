const Database = require('better-sqlite3');
import { app } from 'electron';
import path from 'path';

// Get the user data path
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'requiem.db');

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

  const createEntitiesTable = `
    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('character', 'location')),
      name TEXT NOT NULL,
      subtitle TEXT,
      status_or_type TEXT,
      age_or_climate TEXT,
      faction TEXT,
      lore TEXT,
      setting TEXT,
      personal_notes TEXT,
      tags TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
    );
  `;

  db.exec(createCampaignsTable);
  db.exec(createEntriesTable);
  db.exec(createEntitiesTable);
}
