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
    const stmt = db.prepare('INSERT INTO campaigns (nome, genero, sistema) VALUES (?, ?, ?)');
    const info = stmt.run(data.nome, data.genero, data.sistema);
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-campaign', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE campaigns SET nome = ?, genero = ?, sistema = ? WHERE id = ?');
    stmt.run(data.nome, data.genero, data.sistema, id);
    return true;
  });
  ipcMain.handle('delete-campaign', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    stmt.run(id);
    return true;
  });

  // Entries
  ipcMain.handle('get-entries', (_, campaignId: number) => {
    return db.prepare('SELECT * FROM entries WHERE campaign_id = ? ORDER BY data_criacao DESC').all(campaignId);
  });
  ipcMain.handle('get-entry', (_, id: number) => {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  });
  ipcMain.handle('create-entry', (_, data: any) => {
    const stmt = db.prepare('INSERT INTO entries (campaign_id, titulo, conteudo, data_criacao) VALUES (?, ?, ?, ?)');
    const info = stmt.run(data.campaign_id, data.titulo, data.conteudo, data.data_criacao);
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-entry', (_, id: number, data: any) => {
    const stmt = db.prepare('UPDATE entries SET titulo = ?, conteudo = ? WHERE id = ?');
    stmt.run(data.titulo, data.conteudo, id);
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
      return db.prepare('SELECT * FROM entities WHERE campaign_id = ? AND tipo = ?').all(campaignId, type);
    }
    return db.prepare('SELECT * FROM entities WHERE campaign_id = ?').all(campaignId);
  });
  ipcMain.handle('get-entity', (_, id: number) => {
    return db.prepare('SELECT * FROM entities WHERE id = ?').get(id);
  });
  ipcMain.handle('create-entity', (_, data: any) => {
    const stmt = db.prepare(`
      INSERT INTO entities (
        campaign_id, tipo, nome, subtitulo, status_ou_tipo, idade_ou_clima, 
        faccao, lore, ambientacao, notas_pessoais, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.campaign_id, data.tipo, data.nome, data.subtitulo, data.status_ou_tipo,
      data.idade_ou_clima, data.faccao, data.lore, data.ambientacao, data.notas_pessoais, data.tags
    );
    return info.lastInsertRowid;
  });
  ipcMain.handle('update-entity', (_, id: number, data: any) => {
    const stmt = db.prepare(`
      UPDATE entities SET 
        nome = ?, subtitulo = ?, status_ou_tipo = ?, idade_ou_clima = ?, 
        faccao = ?, lore = ?, ambientacao = ?, notas_pessoais = ?, tags = ?
      WHERE id = ?
    `);
    stmt.run(
      data.nome, data.subtitulo, data.status_ou_tipo, data.idade_ou_clima,
      data.faccao, data.lore, data.ambientacao, data.notas_pessoais, data.tags, id
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
