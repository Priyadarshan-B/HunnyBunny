const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

let backendProcess;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath);
    } else {
      win.loadURL('data:text/html,<h1>❌ dist/index.html not found</h1>');
    }
  }
}

function startBackend() {
  const backendPath = path.join(__dirname, 'mongo_backend', 'src', 'app.js');
  const envPath = path.join(__dirname, 'mongo_backend','src', '.env');
  dotenv.config({ path: envPath });

  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
    },
    stdio: 'inherit',
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopBackend);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
