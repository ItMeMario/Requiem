import { ipcMain } from 'electron';
import { db } from '../database';

export function setupEntryHandlersIpc() {
  ipcMain.handle('get-entries', (_, campaignId: number) => {
    const rows = db.prepare('SELECT * FROM entries WHERE campaign_id = ? ORDER BY creation_date DESC').all(campaignId);
    return rows.map((row: any) => ({
      ...row,
      shared: row.shared === 1 || row.shared === true
    }));
  });

  ipcMain.handle('get-entry', (_, id: number) => {
    const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as any;
    if (!row) return row;
    return {
      ...row,
      shared: row.shared === 1 || row.shared === true
    };
  });

  ipcMain.handle('create-entry', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO entries (campaign_id, title, content, creation_date, shared, authorId, authorName) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(
      data.campaign_id, 
      data.title, 
      data.content ?? null, 
      data.creation_date,
      data.shared ? 1 : 0,
      data.authorId ?? null,
      data.authorName ?? null
    );
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-entry', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE entries SET title = ?, content = ?, shared = ?, authorId = ?, authorName = ? WHERE id = ?');
    stmt.run(
      data.title, 
      data.content ?? null, 
      data.shared ? 1 : 0,
      data.authorId ?? null,
      data.authorName ?? null,
      id
    );
    return true;
  });

  ipcMain.handle('delete-entry', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
