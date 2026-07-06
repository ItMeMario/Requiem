import { ipcMain } from 'electron';
import { db } from '../database';

export function setupCampaignHandlersIpc() {
  ipcMain.handle('get-campaigns', () => {
    const rows = db.prepare('SELECT * FROM campaigns').all();
    return rows.map((row: any) => ({
      ...row,
      collaborators: row.collaborators ? JSON.parse(row.collaborators) : []
    }));
  });

  ipcMain.handle('get-campaign', (_, id: number) => {
    const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    if (!row) return row;
    return {
      ...row,
      collaborators: row.collaborators ? JSON.parse(row.collaborators) : []
    };
  });

  ipcMain.handle('create-campaign', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO campaigns (name, genre, system, ownerId, collaborators) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(
      data.name, 
      data.genre ?? null, 
      data.system ?? null,
      data.ownerId ?? null,
      data.collaborators ? JSON.stringify(data.collaborators) : null
    );
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-campaign', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE campaigns SET name = ?, genre = ?, system = ?, ownerId = ?, collaborators = ? WHERE id = ?');
    stmt.run(
      data.name, 
      data.genre ?? null, 
      data.system ?? null, 
      data.ownerId ?? null,
      data.collaborators ? JSON.stringify(data.collaborators) : null,
      id
    );
    return true;
  });

  ipcMain.handle('delete-campaign', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
