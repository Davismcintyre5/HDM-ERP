const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

function initAutoUpdater(mainWindow) {
  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', async (info) => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Download now?`,
      buttons: ['Download', 'Later'],
    });
    if (response === 0) autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-downloaded', async () => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart now to install?',
      buttons: ['Restart', 'Later'],
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
  });

  autoUpdater.checkForUpdates();
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

module.exports = { initAutoUpdater, checkForUpdates };