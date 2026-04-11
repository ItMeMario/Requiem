import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { db, initDb } from './database';

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

function setupIpc() {
  // Campaigns
  ipcMain.handle('get-campaigns', () => {
    return db.prepare('SELECT * FROM campaigns').all();
  });
  ipcMain.handle('get-campaign', (_, id: number) => {
    return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  });
  ipcMain.handle('create-campaign', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO campaigns (name, genre, system) VALUES (?, ?, ?)');
    const info = stmt.run(data.name, data.genre, data.system);
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-campaign', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE campaigns SET name = ?, genre = ?, system = ? WHERE id = ?');
    stmt.run(data.name, data.genre, data.system, id);
    return true;
  });
  ipcMain.handle('delete-campaign', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    stmt.run(id);
    return true;
  });

  // Entries
  ipcMain.handle('get-entries', (_, campaignId: number) => {
    return db.prepare('SELECT * FROM entries WHERE campaign_id = ? ORDER BY creation_date DESC').all(campaignId);
  });
  ipcMain.handle('get-entry', (_, id: number) => {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  });
  ipcMain.handle('create-entry', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO entries (campaign_id, title, content, creation_date) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.campaign_id, data.title, data.content, data.creation_date);
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-entry', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE entries SET title = ?, content = ? WHERE id = ?');
    stmt.run(data.title, data.content, id);
    return true;
  });
  ipcMain.handle('delete-entry', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
    stmt.run(id);
    return true;
  });

  // Characters
  ipcMain.handle('get-characters', (_, campaignId: number) => {
    return db.prepare('SELECT * FROM characters WHERE campaign_id = ?').all(campaignId);
  });
  ipcMain.handle('get-character', (_, id: number) => {
    return db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  });
  ipcMain.handle('create-character', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO characters (
        campaign_id, name, race, status, age, faction, lore, bonds, personal_notes, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id, data.name, data.race, data.status, data.age,
      data.faction, data.lore, data.bonds, data.personal_notes, data.image_url
    );
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-character', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE characters SET 
        name = ?, race = ?, status = ?, age = ?, 
        faction = ?, lore = ?, bonds = ?, personal_notes = ?, image_url = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name, data.race, data.status, data.age,
      data.faction, data.lore, data.bonds, data.personal_notes, data.image_url, id
    );
    return true;
  });
  ipcMain.handle('delete-character', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    stmt.run(id);
    return true;
  });

  // Locations
  ipcMain.handle('get-locations', (_, campaignId: number) => {
    return db.prepare('SELECT * FROM locations WHERE campaign_id = ?').all(campaignId);
  });
  ipcMain.handle('get-location', (_, id: number) => {
    return db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
  });
  ipcMain.handle('create-location', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO locations (
        campaign_id, name, region, type, description, lore, present_npcs, atmosphere, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id, data.name, data.region, data.type, data.description,
      data.lore, data.present_npcs, data.atmosphere, data.image_url
    );
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-location', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE locations SET 
        name = ?, region = ?, type = ?, description = ?, 
        lore = ?, present_npcs = ?, atmosphere = ?, image_url = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name, data.region, data.type, data.description,
      data.lore, data.present_npcs, data.atmosphere, data.image_url, id
    );
    return true;
  });
  ipcMain.handle('delete-location', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM locations WHERE id = ?');
    stmt.run(id);
    return true;
  });

  // Backups
  ipcMain.handle('export-database', async (event) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Database Backup',
      defaultPath: 'requiem_backup.db',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
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

  ipcMain.handle('import-database', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Database Backup',
      properties: ['openFile'],
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
    });
    
    if (canceled || filePaths.length === 0) return false;
    
    const sourcePath = filePaths[0];
    const dbPath = path.join(app.getPath('userData'), 'requiem.db');
    
    try {
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
}

app.whenReady().then(() => {
  initDb();
  setupIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
