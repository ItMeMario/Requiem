import { app, ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;
const projectRoot = isDev ? process.cwd() : app.getAppPath();
const hasGit = fs.existsSync(path.join(projectRoot, '.git'));

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

// Helper: fetch JSON using Node's native HTTPS module
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Requiem-Updater' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP status ${res.statusCode}`));
        return;
      }
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

// Helper: run spawn command and stream output
function runCommand(command: string, args: string[], cwd: string, onData: (data: string) => void): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: true });
    child.stdout.on('data', (data) => onData(data.toString()));
    child.stderr.on('data', (data) => onData(data.toString()));
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`));
      }
    });
    child.on('error', (err) => reject(err));
  });
}

// Dev Mode (Git) Updater
let currentBranch = 'develop';
let latestDevVersion = '';

async function checkDevUpdate(): Promise<{ available: boolean; latestVersion: string }> {
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectRoot }).toString().trim();
  } catch (e) {
    currentBranch = 'develop';
  }

  const remoteUrl = `https://raw.githubusercontent.com/ItMeMario/Requiem/${currentBranch}/package.json`;
  const remotePkg = await fetchJson(remoteUrl);
  latestDevVersion = remotePkg.version;

  const localVersion = app.getVersion();
  const available = isVersionNewer(localVersion, latestDevVersion);

  return { available, latestVersion: latestDevVersion };
}

async function runDevUpdate() {
  try {
    sendToRenderer('updater-status', { status: 'updating', log: `Starting Git Update on branch [${currentBranch}]...\n` });
    
    // 1. git pull
    sendToRenderer('updater-status', { status: 'updating', log: `> git pull origin ${currentBranch}\n` });
    await runCommand('git', ['pull', 'origin', currentBranch], projectRoot, (data) => {
      sendToRenderer('updater-status', { status: 'updating', log: data });
    });

    // 2. npm install
    sendToRenderer('updater-status', { status: 'updating', log: `\n> npm install\n` });
    await runCommand('npm', ['install'], projectRoot, (data) => {
      sendToRenderer('updater-status', { status: 'updating', log: data });
    });

    sendToRenderer('updater-status', { status: 'downloaded', log: `\nUpdate successfully pulled and dependencies installed! Please restart the application to apply changes.\n` });
  } catch (error: any) {
    sendToRenderer('updater-error', error.message || String(error));
  }
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
    
    if (isDev && hasGit) {
      try {
        const { available, latestVersion } = await checkDevUpdate();
        return {
          available,
          currentVersion,
          latestVersion,
          devMode: true,
          branch: currentBranch
        };
      } catch (err: any) {
        console.error('Failed to check git updates:', err);
        return {
          available: false,
          currentVersion,
          latestVersion: currentVersion,
          devMode: true,
          branch: currentBranch,
          error: err.message || String(err)
        };
      }
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
    if (isDev && hasGit) {
      // Async start dev update
      runDevUpdate();
      return true;
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
    if (isDev && hasGit) {
      // Gracefully relaunch and exit in dev mode
      app.relaunch();
      app.exit();
    } else {
      // Production Mode: destroy all windows first, then quit and install silently.
      // isSilent=true makes NSIS run with /S flag, bypassing all UI dialogs
      // (including the "app cannot be closed" popup).
      // isForceRunAfter=true ensures the app restarts after the update completes.
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
