const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../dist/vite.svg')
  });

  // Open links in the user's default browser instead of a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// IPC handler for opening audio files
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] }],
  });
  if (canceled) {
    return [];
  }

  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
  };

  return filePaths.map(filePath => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'audio/mpeg';
    return {
      name: path.basename(filePath),
      data: fs.readFileSync(filePath),
      mimeType: mimeType,
    };
  });
});

// IPC handler for "loading" VST files
ipcMain.handle('dialog:openVstFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'VST3 Plugins', extensions: ['vst3'] }],
    });
    if (canceled || filePaths.length === 0) {
        return undefined;
    }
    return path.basename(filePaths[0]);
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});