import { ipcMain, shell, app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import Store from 'electron-store';

export function setupIpcHandlers(store: Store): void {
  // Theme management
  ipcMain.handle('get-theme', () => {
    return store.get('theme', 'dark');
  });

  ipcMain.handle('set-theme', (_event, theme: string) => {
    store.set('theme', theme);
    log.info('Theme set to:', theme);
    return theme;
  });

  // Model management
  ipcMain.handle('get-model', () => {
    return store.get('model', 'deepseek');
  });

  ipcMain.handle('set-model', (_event, model: string) => {
    store.set('model', model);
    log.info('Model set to:', model);
    return model;
  });

  // API Keys management
  ipcMain.handle('get-api-keys', () => {
    return store.get('apiKeys', {});
  });

  ipcMain.handle('set-api-key', (_event, provider: string, key: string) => {
    const keys = store.get('apiKeys', {}) as Record<string, string>;
    keys[provider] = key;
    store.set('apiKeys', keys);
    log.info('API Key set for:', provider);
    return keys;
  });

  ipcMain.handle('delete-api-key', (_event, provider: string) => {
    const keys = store.get('apiKeys', {}) as Record<string, string>;
    delete keys[provider];
    store.set('apiKeys', keys);
    log.info('API Key deleted for:', provider);
    return keys;
  });

  // Service status
  ipcMain.handle('check-service-status', async (_event, port: number) => {
    try {
      const http = await import('http');
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve({ running: res.statusCode === 200 });
        });
        req.on('error', () => resolve({ running: false }));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve({ running: false });
        });
      });
    } catch {
      return { running: false };
    }
  });

  // File management
  ipcMain.handle('get-deerflow-outputs', async () => {
    const outputsPath = path.join(app.getPath('home'), 'deerflow', 'outputs');
    return getFilesRecursively(outputsPath);
  });

  ipcMain.handle('open-file', async (_event, filePath: string) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      log.error('Failed to open file:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url);
    return { success: true };
  });

  // Dialog
  ipcMain.handle('show-open-dialog', async (_event, options: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-app-path', () => {
    return {
      home: app.getPath('home'),
      app: app.getPath('app'),
      userData: app.getPath('userData'),
    };
  });

  log.info('IPC handlers set up');
}

function getFilesRecursively(dirPath: string, basePath?: string): { files: any[]; error?: string } {
  const base = basePath || dirPath;
  
  if (!fs.existsSync(dirPath)) {
    return { files: [], error: 'Directory does not exist' };
  }

  const files: any[] = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(base, fullPath);

      if (entry.isDirectory()) {
        const subDir = getFilesRecursively(fullPath, base);
        if (subDir.files.length > 0) {
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'directory',
            children: subDir.files,
          });
        }
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        const isPreviewable = ['.pdf', '.md', '.txt', '.json', '.html', '.png', '.jpg', '.jpeg'].includes(ext);
        
        files.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          type: 'file',
          extension: ext,
          size: fs.statSync(fullPath).size,
          previewable: isPreviewable,
        });
      }
    }
  } catch (error) {
    log.error('Error reading directory:', error);
    return { files: [], error: String(error) };
  }

  return { files };
}
