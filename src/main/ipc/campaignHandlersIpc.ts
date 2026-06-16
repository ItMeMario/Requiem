import { ipcMain } from 'electron';
import { db } from '../database';

export function setupCampaignHandlersIpc() {
  ipcMain.handle('get-campaigns', () => {
    return db.prepare('SELECT * FROM campaigns').all();
  });

  ipcMain.handle('get-campaign', (_, id: number) => {
    return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  });

  ipcMain.handle('create-campaign', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO campaigns (name, genre, system) VALUES (?, ?, ?)');
    const info = stmt.run(data.name, data.genre ?? null, data.system ?? null);
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-campaign', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE campaigns SET name = ?, genre = ?, system = ? WHERE id = ?');
    stmt.run(data.name, data.genre ?? null, data.system ?? null, id);
    return true;
  });

  ipcMain.handle('delete-campaign', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
