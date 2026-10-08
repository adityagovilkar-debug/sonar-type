const { contextBridge, ipcRenderer } = require('electron');

// window controls for the game's own title bar (the window is frameless)
contextBridge.exposeInMainWorld('sonarShell', {
  minimize: () => ipcRenderer.send('win', 'min'),
  maximize: () => ipcRenderer.send('win', 'max'),
  close: () => ipcRenderer.send('win', 'close'),
});
