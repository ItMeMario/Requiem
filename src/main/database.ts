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
      nome TEXT NOT NULL,
      genero TEXT,
      sistema TEXT
    );
  `;

  const createEntriesTable = `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      conteudo TEXT,
      data_criacao TEXT NOT NULL,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
    );
  `;

  const createEntitiesTable = `
    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('character', 'location')),
      nome TEXT NOT NULL,
      subtitulo TEXT,
      status_ou_tipo TEXT,
      idade_ou_clima TEXT,
      faccao TEXT,
      lore TEXT,
      ambientacao TEXT,
      notas_pessoais TEXT,
      tags TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
    );
  `;

  db.exec(createCampaignsTable);
  db.exec(createEntriesTable);
  db.exec(createEntitiesTable);
}
