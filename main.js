const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow = null;
let tray = null;

// ─── Auto Launch on macOS Login ───
function setupAutoLaunch() {
  try {
    const AutoLaunch = require('auto-launch');
    const ritualLauncher = new AutoLaunch({
      name: 'The Ritual',
      path: app.getPath('exe'),
    });
    ritualLauncher.isEnabled().then(isEnabled => {
      if (!isEnabled) {
        ritualLauncher.enable();
        console.log('[Ritual] Auto-launch enabled');
      }
    }).catch(err => console.warn('[Ritual] Auto-launch check failed:', err));
  } catch (e) {
    console.warn('[Ritual] Auto-launch module unavailable:', e.message);
  }
}

// ─── Create Main Window ───
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 480,
    height: 600,
    x: Math.round(width / 2 - 240),
    y: Math.round(height / 2 - 300),
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#0f1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    // Slide in from top
    mainWindow.setOpacity(0);
    let op = 0;
    const fadeIn = setInterval(() => {
      op = Math.min(1, op + 0.08);
      mainWindow.setOpacity(op);
      if (op >= 1) clearInterval(fadeIn);
    }, 16);
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Close when clicking outside (lost focus)
  mainWindow.on('blur', () => {
    // Only auto-close if user has already set today's commitment
    const today = new Date().toISOString().split('T')[0];
    const data = store.get('ritual_data', {});
    if (data.days && data.days[today] && data.days[today].commitment) {
      // Don't force close — let user close manually
    }
  });
}

// ─── Tray Icon ───
function createTray() {
  // Create a simple 16x16 tray icon programmatically
  const iconData = nativeImage.createEmpty();
  // Use template image name for macOS menu bar
  tray = new Tray(iconData);

  const today = new Date().toISOString().split('T')[0];
  const data = store.get('ritual_data', {});
  const done = data.days && data.days[today] && data.days[today].done;

  tray.setToolTip('The Ritual' + (done ? ' ✓' : ''));
  tray.setTitle(done ? '🔥' : '○');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open The Ritual', click: () => { if (!mainWindow) createWindow(); else mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Disable Auto-Launch', click: () => disableAutoLaunch() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (!mainWindow) createWindow();
    else if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
}

function disableAutoLaunch() {
  try {
    const AutoLaunch = require('auto-launch');
    const rl = new AutoLaunch({ name: 'The Ritual', path: app.getPath('exe') });
    rl.disable();
  } catch(e) {}
}

// ─── IPC Handlers ───
ipcMain.handle('get-data', () => store.get('ritual_data', {}));
ipcMain.handle('save-data', (_, data) => { store.set('ritual_data', data); return true; });
ipcMain.handle('close-window', () => { if (mainWindow) mainWindow.hide(); });
ipcMain.handle('minimize-window', () => { if (mainWindow) mainWindow.minimize(); });

// ─── App Lifecycle ───
app.whenReady().then(() => {
  // Hide dock icon — run as menu bar app
  if (app.dock) app.dock.hide();

  setupAutoLaunch();
  createTray();
  createWindow(); // Auto-popup on every launch
});

app.on('window-all-closed', () => {
  // Don't quit — stay in tray
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
