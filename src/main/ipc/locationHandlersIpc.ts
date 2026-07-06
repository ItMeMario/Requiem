import { ipcMain } from 'electron';
import { db } from '../database';

export function setupLocationHandlersIpc() {
  ipcMain.handle('get-locations', (_, campaignId: number) => {
    const rows = db.prepare('SELECT * FROM locations WHERE campaign_id = ?').all(campaignId);
    return rows.map((row: any) => ({
      ...row,
      shared: row.shared === 1 || row.shared === true
    }));
  });

  ipcMain.handle('get-location', (_, id: number) => {
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    if (!row) return row;
    return {
      ...row,
      shared: row.shared === 1 || row.shared === true
    };
  });

  ipcMain.handle('create-location', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO locations (
        campaign_id, name, region, type, description, lore, present_npcs, atmosphere, image_url, shared, authorId, authorName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id,
      data.name,
      data.region ?? null,
      data.type ?? null,
      data.description ?? null,
      data.lore ?? null,
      data.present_npcs ?? null,
      data.atmosphere ?? null,
      data.image_url ?? null,
      data.shared ? 1 : 0,
      data.authorId ?? null,
      data.authorName ?? null
    );
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-location', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE locations SET 
        name = ?, region = ?, type = ?, description = ?, 
        lore = ?, present_npcs = ?, atmosphere = ?, image_url = ?,
        shared = ?, authorId = ?, authorName = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name,
      data.region ?? null,
      data.type ?? null,
      data.description ?? null,
      data.lore ?? null,
      data.present_npcs ?? null,
      data.atmosphere ?? null,
      data.image_url ?? null,
      data.shared ? 1 : 0,
      data.authorId ?? null,
      data.authorName ?? null,
      id
    );
    return true;
  });

  ipcMain.handle('delete-location', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM locations WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
