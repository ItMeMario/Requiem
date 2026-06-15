import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import url from 'url';
import crypto from 'crypto';
import { db, initDb, dbPath as currentDbPath } from './database';

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
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

  // Entries
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
      data.campaign_id, data.name, data.race ?? null, data.status ?? null, data.age ?? null,
      data.faction ?? null, data.lore ?? null, data.bonds ?? null, data.personal_notes ?? null, data.image_url ?? null
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
      data.name, data.race ?? null, data.status ?? null, data.age ?? null,
      data.faction ?? null, data.lore ?? null, data.bonds ?? null, data.personal_notes ?? null, data.image_url ?? null, id
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
      data.campaign_id, data.name, data.region ?? null, data.type ?? null, data.description ?? null,
      data.lore ?? null, data.present_npcs ?? null, data.atmosphere ?? null, data.image_url ?? null
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
      data.name, data.region ?? null, data.type ?? null, data.description ?? null,
      data.lore ?? null, data.present_npcs ?? null, data.atmosphere ?? null, data.image_url ?? null, id
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

  ipcMain.handle('import-database', async (event) => {
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
      const 	shmPath = `${dbPath}-shm`;
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

  ipcMain.handle('import-cloud-database', async (event) => {
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

  // Native Auth (Electron Loopback)
  ipcMain.handle('google-sign-in', async (event, clientId: string) => {
    return new Promise((resolve, reject) => {
      const port = 57233;
      const redirectUri = `http://127.0.0.1:${port}/callback`;
      const nonce = crypto.randomBytes(16).toString('hex');
      const state = crypto.randomBytes(8).toString('hex');

      let server: http.Server | null = null;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (server) {
          server.close();
          server = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // Set a 3-minute timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Login timeout. Please try again."));
      }, 180000);

      server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        if (pathname === '/callback') {
          // Serve JS to extract the hash/fragment and redirect
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Autenticando no Requiem...</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  background-color: #0a0a0f;
                  color: #d1d1d6;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                }
                .spinner {
                  border: 4px solid rgba(255, 255, 255, 0.1);
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  border-left-color: #00ffff;
                  animation: spin 1s linear infinite;
                  margin-bottom: 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <p>Processando credenciais. Aguarde...</p>
              <script>
                if (window.location.hash) {
                  const params = new URLSearchParams(window.location.hash.substring(1));
                  window.location.href = '/token?' + params.toString();
                } else {
                  document.body.innerHTML = '<p>Erro: Nenhuma credencial recebida de volta do Google.</p>';
                }
              </script>
            </body>
            </html>
          `);
        } else if (pathname === '/token') {
          const idToken = parsedUrl.query.id_token as string;
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          if (idToken) {
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Sucesso!</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0a0a0f;
                    color: #d1d1d6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                  }
                  h1 { color: #00ffff; font-weight: 300; }
                </style>
              </head>
              <body>
                <h1>Conectado com Sucesso!</h1>
                <p>O Requiem foi autenticado. Você já pode fechar esta aba e retornar ao aplicativo desktop.</p>
              </body>
              </html>
            `);
            resolve(idToken);
          } else {
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Erro</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0a0a0f;
                    color: #d1d1d6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                </style>
              </head>
              <body>
                <p>Falha ao obter token. Tente novamente.</p>
              </body>
              </html>
            `);
            reject(new Error("No id_token received."));
          }
          cleanup();
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      server.listen(port, '127.0.0.1', () => {
        // Construct the Google OAuth URL
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=token%20id_token` +
          `&scope=openid%20profile%20email` +
          `&nonce=${encodeURIComponent(nonce)}` +
          `&state=${encodeURIComponent(state)}` +
          `&prompt=select_account`;

        shell.openExternal(authUrl);
      });
    });
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

app.on('will-quit', () => {
  try {
    db.close();
  } catch (err) {
    console.error('Error closing database:', err);
  }
});
