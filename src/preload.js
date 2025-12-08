const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Configurações
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  
  // Nova janela de gráfico
  openChartWindow: (data) => ipcRenderer.invoke('open-chart-window', data),
  
  // Adicione mais APIs conforme necessário
  // Exemplo para exchanges:
  // connectExchange: (exchangeData) => ipcRenderer.invoke('connect-exchange', exchangeData),
  // disconnectExchange: (exchangeId) => ipcRenderer.invoke('disconnect-exchange', exchangeId),
  // getBalances: (exchangeId) => ipcRenderer.invoke('get-balances', exchangeId),
});

// Expõe informações da plataforma
contextBridge.exposeInMainWorld('platform', {
  os: process.platform,
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});

console.log('Preload script loaded');
