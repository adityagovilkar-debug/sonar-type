const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: '#0E0F12',
    title: 'Sonar Type',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  // silence the page the moment the window starts closing, before it is torn down
  win.on('close', () => { if (!win.isDestroyed()) win.webContents.setAudioMuted(true); });
  win.on('closed', () => { win = null; });
  win.loadFile(path.join('game', 'index.html'));
}

if (!app.requestSingleInstanceLock()) {
  // a second launch only brings the running game forward; it never opens a window of its own
  app.quit();
} else {
  // no menu: Alt would otherwise open it in the middle of typing
  Menu.setApplicationMenu(null);

  ipcMain.on('win', (e, action) => {
    const w = BrowserWindow.fromWebContents(e.sender);
    if (!w) return;
    if (action === 'min') w.minimize();
    else if (action === 'max') w.isMaximized() ? w.unmaximize() : w.maximize();
    else if (action === 'close') w.close();
  });

  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
