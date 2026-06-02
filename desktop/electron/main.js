const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initAutoUpdater } = require('./utils/autoUpdater');
const { createTray } = require('./tray/trayManager');
const { registerIpcHandlers } = require('./ipc/ipcHandlers');

let mainWindow = null;
let isOnline = true;

const CLIENT_URL = 'https://hdmerp.pxxl.click/login?electron=true';

function createWindow() {
  const windowState = require('./utils/windowManager').getWindowState();

  mainWindow = new BrowserWindow({
    ...windowState,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f9fafb',
    show: false,
  });

  mainWindow.loadURL(CLIENT_URL);

  mainWindow.once('ready-to-show', () => { mainWindow.show(); });
  mainWindow.on('resize', () => require('./utils/windowManager').saveWindowState(mainWindow));
  mainWindow.on('move', () => require('./utils/windowManager').saveWindowState(mainWindow));
  mainWindow.on('closed', () => { mainWindow = null; });

  createTray(mainWindow);
  initAutoUpdater(mainWindow);
}

function checkOnlineStatus() {
  return require('dns').promises.resolve('hdmerpserver.pxxl.click').then(() => true).catch(() => false);
}

setInterval(async () => {
  isOnline = await checkOnlineStatus();
  if (mainWindow) mainWindow.webContents.send('online-status', isOnline);
}, 10000);

ipcMain.handle('get-online-status', () => isOnline);

registerIpcHandlers();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }
else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}