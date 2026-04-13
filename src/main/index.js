const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

let mainWindow;
let tray;
const DEERFLOW_PORT = 2026;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADlSURBVDiNpZMxCsJAEEXfJoWFnkDwBHoCj+IJPIWtN/ASYuMNxBuIHkDwBLoFL+ANxMtW1ga2sZVYKFpZWRVzYRw3MzO7M7sL3I6BQcBAJpJe5O5AcqQOiQFyAMnZVQCeAM4BTwB7kByXAM5AcjwBSAH4AHCQJFIAvAD+BgkgDuSgDWAJYA9SAApAG8gpfxhAnAMCQAbkkAyBvAtAHkEYArgG5JBDYAtSCJPgHYA3iQBGAN0gBGQLYtgHOQDAuAEpBjfwDYSCKkgKwFIJ+TAGpBslYA1SCIJAmkKQC5KQeIASkBqQAqQApACpACkAKkAKQApACpACkAKkAKQApACpACkAKkALwBdiFAKkBV6AQAAAAASUVORK5CYII=');
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开 Biochat', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: '退出', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('Biochat');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

function checkService() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${DEERFLOW_PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function checkDocker() {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      resolve(!error);
    });
  });
}

ipcMain.handle('check-service', async () => {
  return await checkService();
});

ipcMain.handle('check-docker', async () => {
  return await checkDocker();
});

ipcMain.handle('start-deerflow', async (event, deerflowPath) => {
  const dockerRunning = await checkDocker();
  if (!dockerRunning) {
    return { success: false, error: 'Docker 未运行，请先启动 Docker Desktop' };
  }
  
  return new Promise((resolve) => {
    const proc = exec(`cd "${deerflowPath}" && docker compose up -d`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: stderr || error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('stop-deerflow', async (event, deerflowPath) => {
  return new Promise((resolve) => {
    exec(`cd "${deerflowPath}" && docker compose down`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: stderr || error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  
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

app.on('before-quit', () => {
  app.isQuitting = true;
});
