import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),

  // Model
  getModel: () => ipcRenderer.invoke('get-model'),
  setModel: (model: string) => ipcRenderer.invoke('set-model', model),

  // API Keys
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  setApiKey: (provider: string, key: string) => ipcRenderer.invoke('set-api-key', provider, key),
  deleteApiKey: (provider: string) => ipcRenderer.invoke('delete-api-key', provider),

  // Service status
  checkServiceStatus: (port: number) => ipcRenderer.invoke('check-service-status', port),

  // File management
  getDeerflowOutputs: () => ipcRenderer.invoke('get-deerflow-outputs'),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // Dialog
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // Navigation events from main process
  onNavigate: (callback: (path: string) => void) => {
    ipcRenderer.on('navigate', (_event, path) => callback(path));
  },
});

// Type declarations
declare global {
  interface Window {
    electronAPI: {
      getTheme: () => Promise<string>;
      setTheme: (theme: string) => Promise<string>;
      getModel: () => Promise<string>;
      setModel: (model: string) => Promise<string>;
      getApiKeys: () => Promise<Record<string, string>>;
      setApiKey: (provider: string, key: string) => Promise<Record<string, string>>;
      deleteApiKey: (provider: string) => Promise<Record<string, string>>;
      checkServiceStatus: (port: number) => Promise<{ running: boolean }>;
      getDeerflowOutputs: () => Promise<{ files: any[]; error?: string }>;
      openFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      openExternal: (url: string) => Promise<{ success: boolean }>;
      showOpenDialog: (options: any) => Promise<any>;
      getAppVersion: () => Promise<string>;
      getAppPath: () => Promise<{ home: string; app: string; userData: string }>;
      onNavigate: (callback: (path: string) => void) => void;
    };
  }
}
