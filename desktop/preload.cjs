const { contextBridge, ipcRenderer } = require('electron');
const listeners = new Map();
const api = {
  storage: {
    local: { get: keys => ipcRenderer.invoke('storage:get', keys), set: value => ipcRenderer.invoke('storage:set', value) },
    onChanged: {
      addListener(fn) { if (listeners.has(fn)) return; const wrapped = (_, changes) => fn(changes, 'local'); listeners.set(fn, wrapped); ipcRenderer.on('storage:changed', wrapped); },
      removeListener(fn) { const wrapped = listeners.get(fn); if (wrapped) ipcRenderer.removeListener('storage:changed', wrapped); listeners.delete(fn); },
    },
  },
  runtime: { id: 'mongbo-desktop', getURL: path => `mongbo://app/${path}`, sendMessage: message => ipcRenderer.invoke('app:action', message?.type === 'mongbo-open-studio' ? 'studio' : message?.type === 'mongbo-open-library' ? 'library' : '') },
  tabs: { create: () => ipcRenderer.invoke('app:action', 'studio'), query: async () => [] },
};
contextBridge.exposeInMainWorld('mongboDesktop', {
  api,
  regions: rects => ipcRenderer.send('overlay:regions', rects),
  dragging: active => ipcRenderer.send('overlay:dragging', active),
  menu: id => ipcRenderer.invoke('overlay:menu', id),
  onSpeak: fn => { const wrapped = (_, id) => fn(id); ipcRenderer.on('overlay:speak', wrapped); },
});
