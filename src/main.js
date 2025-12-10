const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Previne múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Alguém tentou executar uma segunda instância, focamos nossa janela
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Armazenamento de estado (pode usar electron-store para persistência)
let mainWindow;
let chartWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'default', // Permite arrastar e duplo clique para maximizar
    frame: true,
    show: false, // Mostra apenas quando estiver pronto
    movable: true, // Permite mover entre displays
    resizable: true, // Permite redimensionar
    fullscreenable: true // Permite fullscreen
  });

  // Carrega o arquivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Mostra a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Descomente para debug: mainWindow.webContents.openDevTools();
  });

  // Quando a janela for fechada, encerra o app completamente
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit(); // Força o encerramento do Electron
  });
}

// Função para criar janela de gráfico
function createChartWindow(data) {
  if (chartWindow) {
    chartWindow.focus();
    return;
  }

  chartWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: '#0f172a',
    title: 'Histórico - Portfolio',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // HTML inline para o gráfico
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Histórico do Portfolio</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #0f172a;
      font-family: Arial, sans-serif;
      color: white;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    #chartContainer {
      width: 100%;
      height: 500px;
      background: #1e293b;
      padding: 20px;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <h1>📈 Evolução do Portfolio</h1>
  <div id="chartContainer">
    <canvas id="myChart"></canvas>
  </div>
  
  <script>
    const data = ${JSON.stringify(data)};
    
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Portfolio (USD)',
          data: data.values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#1E3A8A',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#F3F4F6' }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(55, 65, 81, 0.5)' },
            ticks: { color: '#9CA3AF' }
          },
          y: {
            grid: { color: 'rgba(55, 65, 81, 0.5)' },
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  </script>
</body>
</html>
  `;

  chartWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  
  chartWindow.on('closed', () => {
    chartWindow = null;
  });
}

// Handler IPC para abrir janela de gráfico
ipcMain.handle('open-chart-window', (event, data) => {
  createChartWindow(data);
  return { success: true };
});

// Inicializa o app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fecha o app quando todas as janelas são fechadas
app.on('window-all-closed', () => {
  // Sempre encerra o app, mesmo no macOS
  app.quit();
});

// IPC Handlers - Exemplo de comunicação entre processos
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// Exemplo: salvar configurações
ipcMain.handle('save-config', async (event, config) => {
  try {
    // Aqui você pode salvar usando electron-store ou fs
    console.log('Salvando configuração:', config);
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return { success: false, error: error.message };
  }
});

// Exemplo: carregar configurações
ipcMain.handle('load-config', async () => {
  try {
    // Aqui você pode carregar usando electron-store ou fs
    return { success: true, data: {} };
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    return { success: false, error: error.message };
  }
});
