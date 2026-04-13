import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';
import log from 'electron-log';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow): void {
  // Create tray icon (use a simple icon)
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../resources/icon.png');

  // Create a simple icon if not exists
  let icon: nativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      // Create a simple 16x16 icon
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.isEmpty() ? createDefaultIcon() : icon);
  tray.setToolTip('Biochat - DeerFlow Desktop Client');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Biochat',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: 'New Chat',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/chat');
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/settings');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  log.info('Tray created');
}

function createDefaultIcon(): nativeImage {
  // Create a simple 16x16 icon with primary color
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 1;
    
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    if (distance <= radius) {
      // Primary blue color: #246BFD
      canvas[i * 4] = 0x24;     // R
      canvas[i * 4 + 1] = 0x6B; // G
      canvas[i * 4 + 2] = 0xFD; // B
      canvas[i * 4 + 3] = 0xFF; // A
    } else {
      // Transparent
      canvas[i * 4] = 0;
      canvas[i * 4 + 1] = 0;
      canvas[i * 4 + 2] = 0;
      canvas[i * 4 + 3] = 0;
    }
  }

  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
    log.info('Tray destroyed');
  }
}
