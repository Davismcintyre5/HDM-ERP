const { ipcMain, BrowserWindow, app } = require('electron');

function registerIpcHandlers() {
  // Window controls
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  ipcMain.handle('window-is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win?.isMaximized() || false;
  });

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Check for updates
  ipcMain.on('check-for-updates', () => {
    const { checkForUpdates } = require('../utils/autoUpdater');
    checkForUpdates();
  });
}

module.exports = { registerIpcHandlers };