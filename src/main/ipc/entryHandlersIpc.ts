import { ipcMain } from 'electron';
import { db } from '../database';

export function setupEntryHandlersIpc() {
  ipcMain.handle('get-entries', (_, campaignId: number) => {
    return db.prepare('SELECT * FROM entries WHERE campaign_id = ? ORDER BY creation_date DESC').all(campaignId);
  });

  ipcMain.handle('get-entry', (_, id: number) => {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  });

  ipcMain.handle('create-entry', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO entries (campaign_id, title, content, creation_date) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.campaign_id, data.title, data.content ?? null, data.creation_date);
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-entry', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE entries SET title = ?, content = ? WHERE id = ?');
    stmt.run(data.title, data.content ?? null, id);
    return true;
  });

  ipcMain.handle('delete-entry', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
