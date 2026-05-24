const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initAutoUpdater } = require('./utils/autoUpdater');
const { createTray } = require('./tray/trayManager');
const { registerIpcHandlers } = require('./ipc/ipcHandlers');

let mainWindow = null;
let tray = null;

const isDev = !app.isPackaged;

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
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#f9fafb',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/login?electron=true');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('https://hdmerp.pxxl.click/login?electron=true');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('resize', () => require('./utils/windowManager').saveWindowState(mainWindow));
  mainWindow.on('move', () => require('./utils/windowManager').saveWindowState(mainWindow));
  mainWindow.on('closed', () => { mainWindow = null; });

  tray = createTray(mainWindow);
  if (!isDev) initAutoUpdater(mainWindow);
}

registerIpcHandlers();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}