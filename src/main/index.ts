import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import log from 'electron-log';
import { createTray, destroyTray } from './tray';
import { setupIpcHandlers } from './ipc';
import Store from 'electron-store';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Application starting...');

// Initialize store
const store = new Store({
  defaults: {
    theme: 'dark',
    model: 'deepseek',
    apiKeys: {},
    windowBounds: { width: 1200, height: 800 },
  },
});

let mainWindow: BrowserWindow | null = null;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
});

function createWindow(): void {
  const { width, height } = store.get('windowBounds') as { width: number; height: number };

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Main window shown');
  });

  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    if (mainWindow) {
      const { width, height } = mainWindow.getBounds();
      store.set('windowBounds', { width, height });
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  log.info('Main window created');
}

app.whenReady().then(() => {
  log.info('App ready');
  
  createWindow();
  createTray(mainWindow!);
  setupIpcHandlers(store);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  destroyTray();
});

// Export for IPC
export { mainWindow, store };
