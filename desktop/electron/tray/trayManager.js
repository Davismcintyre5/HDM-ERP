const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

function createTray(mainWindow) {
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', '..', 'assets', 'logo.png')).resize({ width: 16, height: 16 });
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open HDM ERP', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Check for Updates', click: () => { require('../utils/autoUpdater').checkForUpdates(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } },
  ]);

  tray.setToolTip('HDM ERP');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });

  return tray;
}

module.exports = { createTray };