import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDb, db } from './database';
import { setMainWindow, setupUpdaterIpc } from './updater';
import { setupIpc } from './ipc/ipcRegistryIpc';

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
  setMainWindow(win);
}

app.whenReady().then(() => {
  initDb();
  setupIpc();
  setupUpdaterIpc();
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

