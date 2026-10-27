const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, protocol, net, screen, session, shell, dialog, powerMonitor } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { validatePatch, validateRegions } = require('./state.cjs');

app.setName('MongBo');
if (app.commandLine.hasSwitch('user-data-dir')) app.setPath('userData', path.resolve(app.commandLine.getSwitchValue('user-data-dir')));
protocol.registerSchemesAsPrivileged([{ scheme: 'mongbo', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
if (!app.requestSingleInstanceLock()) { app.quit(); } else {
let overlay, studio, library, tray, state = {}, regions = [], dragging = false, ignoring = true, hidden = false, monitorId, cursorTimer;
const webRoot = path.join(__dirname, 'web');
const stateFile = () => path.join(app.getPath('userData'), 'companions.json');
const thai = () => state.language !== 'en';
const label = (th, en) => thai() ? th : en;

function trusted(event, overlayOnly = false) {
  const win = BrowserWindow.fromWebContents(event.sender);
  const allowed = overlayOnly ? [overlay] : [overlay, studio, library];
  return allowed.includes(win) && event.senderFrame === event.sender.mainFrame && /^mongbo:\/\/app\/(desktop|index|popup)\.html$/.test(event.senderFrame.url);
}
function save(patch) {
  const clean = validatePatch(patch), next = { ...state, ...clean };
  const temp = stateFile() + '.tmp'; fs.mkdirSync(path.dirname(temp), { recursive: true });
  fs.writeFileSync(temp, JSON.stringify(next), 'utf8'); fs.renameSync(temp, stateFile());
  state = next;
  for (const win of [overlay, studio, library]) if (win && !win.isDestroyed()) win.webContents.send('storage:changed', clean);
  updateTray();
}
function workArea() { return (screen.getAllDisplays().find(d => d.id === monitorId) ?? screen.getPrimaryDisplay()).workArea; }
function resetBounds() { if (overlay && !overlay.isDestroyed()) { regions = []; dragging = false; overlay.setBounds(workArea()); } }
function toggleHidden() { hidden = !hidden; if (hidden) overlay.hide(); else overlay.showInactive(); updateTray(); }
function togglePause() { save({ preferences: { ...state.preferences, paused: !state.preferences?.paused } }); }
function updateTray() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: label('จัดการเพื่อน', 'Manage friends'), click: () => openWindow('popup') },
    { label: label('สร้าง / แต่งตัวละคร', 'Create / customize'), click: () => openWindow('index') },
    { type: 'separator' },
    { label: label('พักการเดิน', 'Pause walking'), type: 'checkbox', checked: !!state.preferences?.paused, click: togglePause },
    { label: hidden ? label('แสดงเพื่อน', 'Show friends') : label('ซ่อนเพื่อน', 'Hide friends'), click: toggleHidden },
    { label: label('เลือกหน้าจอ', 'Choose display'), submenu: screen.getAllDisplays().map((d, i) => ({ label: `${i + 1}: ${d.label || `${d.size.width} × ${d.size.height}`}`, type: 'radio', checked: d.id === (monitorId ?? screen.getPrimaryDisplay().id), click: () => { monitorId = d.id; resetBounds(); updateTray(); } })) },
    { type: 'separator' }, { label: label('ออกจาก MongBo', 'Quit MongBo'), click: () => app.quit() },
  ]));
}
function secureWindow(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'https://github.com/Waiproness' || url === 'https://mongbo-8nr.pages.dev/') void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => { if (!/^mongbo:\/\/app\/(desktop|index|popup)\.html$/.test(url)) event.preventDefault(); });
  win.webContents.on('render-process-gone', () => { if (win === overlay) { dragging = false; regions = []; overlay.setIgnoreMouseEvents(true, { forward: true }); } });
}
const prefs = () => ({ preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true });
function openWindow(kind) {
  let win = kind === 'index' ? studio : library;
  if (win && !win.isDestroyed()) { win.show(); win.focus(); return; }
  win = new BrowserWindow({ title: kind === 'index' ? 'MongBo Studio' : 'MongBo — Friends', width: kind === 'index' ? 1180 : 380, height: kind === 'index' ? 850 : 760, minWidth: kind === 'index' ? 360 : 350, minHeight: 480, autoHideMenuBar: true, icon: path.join(__dirname, 'icon.png'), webPreferences: prefs() });
  if (kind === 'index') studio = win; else library = win;
  secureWindow(win); void win.loadURL(`mongbo://app/${kind}.html`);
  win.on('closed', () => { if (kind === 'index') studio = null; else library = null; });
}
app.on('second-instance', () => openWindow('popup'));
app.on('window-all-closed', () => {});
app.on('before-quit', () => { clearInterval(cursorTimer); tray?.destroy(); });

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  try { if (fs.existsSync(stateFile())) state = validatePatch(JSON.parse(fs.readFileSync(stateFile(), 'utf8'))); }
  catch { dialog.showErrorBox('MongBo', `Cannot read saved companions. The file was preserved:\n${stateFile()}`); app.quit(); return; }
  protocol.handle('mongbo', async request => {
    try {
      const url = new URL(request.url), filename = path.resolve(webRoot, '.' + decodeURIComponent(url.pathname));
      if (url.host !== 'app' || !filename.startsWith(webRoot + path.sep)) return new Response('Forbidden', { status: 403 });
      const response = await net.fetch(pathToFileURL(filename).href);
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'");
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(response.body, { status: response.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  session.defaultSession.setPermissionRequestHandler((_, __, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] }, (_, callback) => callback({ cancel: true }));
  ipcMain.handle('storage:get', (event, keys) => {
    if (!trusted(event) || !Array.isArray(keys) || keys.length > 5 || keys.some(key => !['pet', 'collection', 'activeIds', 'language', 'preferences'].includes(key))) throw new Error('Invalid request');
    return Object.fromEntries(keys.filter(key => state[key] !== undefined).map(key => [key, state[key]]));
  });
  ipcMain.handle('storage:set', (event, patch) => { if (!trusted(event)) throw new Error('Invalid sender'); save(patch); });
  ipcMain.handle('app:action', (event, action) => { if (!trusted(event) || !['studio', 'library'].includes(action)) throw new Error('Invalid action'); openWindow(action === 'studio' ? 'index' : 'popup'); });
  ipcMain.on('overlay:regions', (event, value) => { if (!trusted(event, true)) return; try { regions = validateRegions(value); } catch { regions = []; } });
  ipcMain.on('overlay:dragging', (event, value) => { if (trusted(event, true) && typeof value === 'boolean') dragging = value; });
  ipcMain.handle('overlay:menu', (event, id) => {
    if (!trusted(event, true) || typeof id !== 'string' || id.length > 80) throw new Error('Invalid request');
    Menu.buildFromTemplate([
      { label: label('พูดสักหน่อย', 'Say something'), click: () => overlay.webContents.send('overlay:speak', id) },
      { label: label('จัดการเพื่อน', 'Manage friends'), click: () => openWindow('popup') },
      { label: label('สร้าง / แต่งตัวละคร', 'Create / customize'), click: () => openWindow('index') },
      { label: label('พัก / เดินต่อ', 'Pause / resume'), click: togglePause },
      { label: label('ซ่อนเพื่อน', 'Hide friends'), click: toggleHidden },
      { type: 'separator' }, { label: label('ออกจาก MongBo', 'Quit MongBo'), click: () => app.quit() },
    ]).popup({ window: overlay });
  });
  overlay = new BrowserWindow({ ...workArea(), transparent: true, backgroundColor: '#00000000', frame: false, resizable: false, movable: false, minimizable: false, maximizable: false, hasShadow: false, skipTaskbar: true, alwaysOnTop: true, show: false, webPreferences: prefs() });
  overlay.setIgnoreMouseEvents(true, { forward: true }); secureWindow(overlay);
  overlay.once('ready-to-show', () => overlay.showInactive());
  await overlay.loadURL('mongbo://app/desktop.html');
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon.png')));
  tray.setToolTip('MongBo — มองโบ๋'); tray.on('double-click', () => openWindow('popup')); updateTray();
  cursorTimer = setInterval(() => {
    if (overlay.isDestroyed()) return;
    const cursor = screen.getCursorScreenPoint(), origin = overlay.getBounds();
    const hit = dragging || regions.some(r => cursor.x >= origin.x + r.x && cursor.x <= origin.x + r.x + r.width && cursor.y >= origin.y + r.y && cursor.y <= origin.y + r.y + r.height);
    const next = !hit;
    if (next !== ignoring) { ignoring = next; overlay.setIgnoreMouseEvents(next, { forward: true }); }
  }, 30);
  screen.on('display-metrics-changed', resetBounds); screen.on('display-added', () => { resetBounds(); updateTray(); }); screen.on('display-removed', () => { resetBounds(); updateTray(); });
  powerMonitor.on('suspend', () => { dragging = false; }); powerMonitor.on('resume', resetBounds);
  openWindow('popup');
}).catch(error => { dialog.showErrorBox('MongBo', error.message); app.quit(); });
}
