import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import { db, dbPath as currentDbPath } from '../database';

export function setupBackupHandlersIpc() {
  // Backups
  ipcMain.handle('export-database', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Database Backup',
      defaultPath: 'requiem_backup.db',
      filters: [
        { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (canceled || !filePath) return false;
    
    try {
      await db.backup(filePath);
      return true;
    } catch (err) {
      console.error('Error exporting database:', err);
      throw err;
    }
  });

  ipcMain.handle('import-database', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Database Backup',
      properties: ['openFile'],
      filters: [
        { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (canceled || filePaths.length === 0) return false;
    
    const sourcePath = filePaths[0];
    const dbPath = currentDbPath;
    
    try {
      // Validate that source file is a valid SQLite database
      const buffer = Buffer.alloc(16);
      const fd = fs.openSync(sourcePath, 'r');
      fs.readSync(fd, buffer, 0, 16, 0);
      fs.closeSync(fd);
      
      const expectedHeader = "SQLite format 3\0";
      let isValid = true;
      for (let i = 0; i < expectedHeader.length; i++) {
        if (buffer[i] !== expectedHeader.charCodeAt(i)) {
          isValid = false;
          break;
        }
      }
      
      if (!isValid) {
        throw new Error("The selected file is not a valid SQLite database.");
      }

      db.close();
      const walPath = `${dbPath}-wal`;
      const shmPath = `${dbPath}-shm`;
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      
      fs.copyFileSync(sourcePath, dbPath);
      app.relaunch();
      app.exit();
      return true;
    } catch (err) {
      console.error('Error importing database:', err);
      throw err;
    }
  });

  ipcMain.handle('export-cloud-database', async (event, data: { campaigns: any[], characters: any[], locations: any[], entries: any[] }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Cloud Database Backup',
      defaultPath: 'requiem_cloud_backup.db',
      filters: [
        { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (canceled || !filePath) return false;
    
    // If file exists, delete it first to start clean
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    
    const tempDb = new (require('better-sqlite3'))(filePath);
    try {
      tempDb.exec(`
        CREATE TABLE campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          genre TEXT,
          system TEXT
        );
        CREATE TABLE entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          creation_date TEXT NOT NULL
        );
        CREATE TABLE characters (
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
        CREATE TABLE locations (
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
      
      const insertCamp = tempDb.prepare('INSERT INTO campaigns (id, name, genre, system) VALUES (?, ?, ?, ?)');
      const insertEntry = tempDb.prepare('INSERT INTO entries (id, campaign_id, title, content, creation_date) VALUES (?, ?, ?, ?, ?)');
      const insertChar = tempDb.prepare('INSERT INTO characters (id, campaign_id, name, race, status, age, faction, lore, bonds, personal_notes, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const insertLoc = tempDb.prepare('INSERT INTO locations (id, campaign_id, name, region, type, description, lore, present_npcs, atmosphere, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      
      tempDb.transaction(() => {
        for (const camp of data.campaigns) {
          insertCamp.run(camp.id, camp.name, camp.genre ?? null, camp.system ?? null);
        }
        for (const entry of data.entries) {
          insertEntry.run(entry.id, entry.campaign_id, entry.title, entry.content ?? null, entry.creation_date);
        }
        for (const char of data.characters) {
          insertChar.run(char.id, char.campaign_id, char.name, char.race ?? null, char.status ?? null, char.age ?? null, char.faction ?? null, char.lore ?? null, char.bonds ?? null, char.personal_notes ?? null, char.image_url ?? null);
        }
        for (const loc of data.locations) {
          insertLoc.run(loc.id, loc.campaign_id, loc.name, loc.region ?? null, loc.type ?? null, loc.description ?? null, loc.lore ?? null, loc.present_npcs ?? null, loc.atmosphere ?? null, loc.image_url ?? null);
        }
      })();
      
      return true;
    } catch (err) {
      console.error('Error exporting cloud database:', err);
      throw err;
    } finally {
      tempDb.close();
    }
  });

  ipcMain.handle('import-cloud-database', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import SQLite Backup to Cloud',
      properties: ['openFile'],
      filters: [
        { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (canceled || filePaths.length === 0) return null;
    
    const sourcePath = filePaths[0];
    
    // Validate that source file is a valid SQLite database
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(sourcePath, 'r');
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);
    
    const expectedHeader = "SQLite format 3\0";
    let isValid = true;
    for (let i = 0; i < expectedHeader.length; i++) {
      if (buffer[i] !== expectedHeader.charCodeAt(i)) {
        isValid = false;
        break;
      }
    }
    
    if (!isValid) {
      throw new Error("The selected file is not a valid SQLite database.");
    }
    
    const tempDb = new (require('better-sqlite3'))(sourcePath, { readonly: true });
    try {
      const tableExists = (tableName: string) => {
        const row = tempDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
        return !!row;
      };
      
      const campaigns = tableExists('campaigns') ? tempDb.prepare('SELECT * FROM campaigns').all() : [];
      const entries = tableExists('entries') ? tempDb.prepare('SELECT * FROM entries').all() : [];
      const characters = tableExists('characters') ? tempDb.prepare('SELECT * FROM characters').all() : [];
      const locations = tableExists('locations') ? tempDb.prepare('SELECT * FROM locations').all() : [];
      
      return { campaigns, entries, characters, locations };
    } catch (err) {
      console.error('Error importing cloud database:', err);
      throw err;
    } finally {
      tempDb.close();
    }
  });
}
