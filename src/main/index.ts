import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
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

  // Entities
  ipcMain.handle('get-entities', (_, campaignId: number, type?: string) => {
    if (type) {
      return db.prepare('SELECT * FROM entities WHERE campaign_id = ? AND type = ?').all(campaignId, type);
    }
    return db.prepare('SELECT * FROM entities WHERE campaign_id = ?').all(campaignId);
  });
  ipcMain.handle('get-entity', (_, id: number) => {
    return db.prepare('SELECT * FROM entities WHERE id = ?').get(id);
  });
  ipcMain.handle('create-entity', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO entities (
        campaign_id, type, name, subtitle, status_or_type, age_or_climate, 
        faction, lore, setting, personal_notes, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id, data.type, data.name, data.subtitle, data.status_or_type,
      data.age_or_climate, data.faction, data.lore, data.setting, data.personal_notes, data.tags
    );
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-entity', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE entities SET 
        name = ?, subtitle = ?, status_or_type = ?, age_or_climate = ?, 
        faction = ?, lore = ?, setting = ?, personal_notes = ?, tags = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name, data.subtitle, data.status_or_type, data.age_or_climate,
      data.faction, data.lore, data.setting, data.personal_notes, data.tags, id
    );
    return true;
  });
  ipcMain.handle('delete-entity', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM entities WHERE id = ?');
    stmt.run(id);
    return true;
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
