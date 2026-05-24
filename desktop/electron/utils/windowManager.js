const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const stateFile = path.join(app.getPath('userData'), 'window-state.json');

function getWindowState() {
  try {
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      return {
        x: state.x,
        y: state.y,
        width: state.width || 1200,
        height: state.height || 800,
      };
    }
  } catch {}
  return { width: 1200, height: 800 };
}

function saveWindowState(win) {
  try {
    const bounds = win.getBounds();
    fs.writeFileSync(stateFile, JSON.stringify({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }));
  } catch {}
}

module.exports = { getWindowState, saveWindowState };