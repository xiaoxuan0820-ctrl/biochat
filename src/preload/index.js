const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkService: () => ipcRenderer.invoke('check-service'),
  checkDocker: () => ipcRenderer.invoke('check-docker'),
  startDeerflow: (path) => ipcRenderer.invoke('start-deerflow', path),
  stopDeerflow: (path) => ipcRenderer.invoke('stop-deerflow', path),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
