import { app, ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win;
}

function sendToRenderer(channel: string, ...args: any[]) {
  const win = mainWindow || BrowserWindow.getAllWindows()[0];
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args);
  }
}

// Helper: compare versions (semver comparison)
function isVersionNewer(local: string, remote: string): boolean {
  const localParts = local.split('.').map(Number);
  const remoteParts = remote.split('.').map(Number);
  for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
    const localVal = localParts[i] || 0;
    const remoteVal = remoteParts[i] || 0;
    if (remoteVal > localVal) return true;
    if (localVal > remoteVal) return false;
  }
  return false;
}

// Configure electron-updater for Production Mode
autoUpdater.autoDownload = false;

autoUpdater.on('checking-for-update', () => {
  sendToRenderer('updater-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  sendToRenderer('updater-status', {
    status: 'update-available',
    latestVersion: info.version
  });
});

autoUpdater.on('update-not-available', () => {
  sendToRenderer('updater-status', { status: 'update-not-available' });
});

autoUpdater.on('error', (err) => {
  sendToRenderer('updater-error', err.message || 'Error checking for updates');
});

autoUpdater.on('download-progress', (progressObj) => {
  sendToRenderer('updater-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
  sendToRenderer('updater-status', { status: 'downloaded' });
});

// Setup IPC listeners
export function setupUpdaterIpc() {
  ipcMain.handle('updater-check', async () => {
    const currentVersion = app.getVersion();
    
    if (isDev) {
      return {
        available: false,
        currentVersion,
        latestVersion: currentVersion,
        devMode: true
      };
    } else {
      // Production Mode
      try {
        const updateInfo = await autoUpdater.checkForUpdates();
        const latestVersion = updateInfo?.updateInfo?.version || currentVersion;
        const available = isVersionNewer(currentVersion, latestVersion);
        return {
          available,
          currentVersion,
          latestVersion,
          devMode: false
        };
      } catch (err: any) {
        console.error('Failed to check production updates:', err);
        return {
          available: false,
          currentVersion,
          latestVersion: currentVersion,
          devMode: false,
          error: err.message || String(err)
        };
      }
    }
  });

  ipcMain.handle('updater-start', async () => {
    if (isDev) {
      return false;
    } else {
      // Production Mode - download the update
      try {
        await autoUpdater.downloadUpdate();
        return true;
      } catch (err: any) {
        sendToRenderer('updater-error', err.message || 'Failed to download update');
        return false;
      }
    }
  });

  ipcMain.handle('updater-restart', () => {
    if (isDev) {
      app.relaunch();
      app.exit();
    } else {
      // Production Mode: destroy all windows first, then quit and install silently.
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(w => {
        w.removeAllListeners('close');
        w.destroy();
      });

      // Small delay to allow windows to fully close before launching installer
      setTimeout(() => {
        autoUpdater.quitAndInstall(true, true);
      }, 1000);
    }
  });
}

