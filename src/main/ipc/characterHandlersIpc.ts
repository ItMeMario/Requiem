import { ipcMain } from 'electron';
import { db } from '../database';

export function setupCharacterHandlersIpc() {
  ipcMain.handle('get-characters', (_, campaignId: number) => {
    const rows = db.prepare('SELECT * FROM characters WHERE campaign_id = ?').all(campaignId);
    return rows.map((row: any) => ({
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : []
    }));
  });

  ipcMain.handle('get-character', (_, id: number) => {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return row;
    return {
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : []
    };
  });

  ipcMain.handle('create-character', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO characters (
        campaign_id, name, race, status, age, faction, lore, bonds, personal_notes, image_url, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id,
      data.name,
      data.race ?? null,
      data.status ?? null,
      data.age ?? null,
      data.faction ?? null,
      data.lore ?? null,
      data.bonds ?? null,
      data.personal_notes ?? null,
      data.image_url ?? null,
      data.attachments ? JSON.stringify(data.attachments) : null
    );
    return info.lastInsertRowid;
  });

  ipcMain.handle('update-character', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE characters SET 
        name = ?, race = ?, status = ?, age = ?, 
        faction = ?, lore = ?, bonds = ?, personal_notes = ?, image_url = ?, attachments = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name,
      data.race ?? null,
      data.status ?? null,
      data.age ?? null,
      data.faction ?? null,
      data.lore ?? null,
      data.bonds ?? null,
      data.personal_notes ?? null,
      data.image_url ?? null,
      data.attachments ? JSON.stringify(data.attachments) : null,
      id
    );
    return true;
  });

  ipcMain.handle('delete-character', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    stmt.run(id);
    return true;
  });
}
