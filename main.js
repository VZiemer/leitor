const electron = require('electron')
// Módulo para controlar a vida da aplicação.
const app = electron.app





// Módulo para criar janela do navegador da nossa aplicação.
const BrowserWindow = electron.BrowserWindow

// Estamos mantendo uma referência global da nossa mainWindow, se não fizermos isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado pelo garbage collector.
let mainWindow

function createWindow () {
  // Cria a janela do navegador.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // Agora carregamos o index.html do aplicativo.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Abre a DevTools assim que a aplicação é executada (Fazemos isso apenas quando estamos desenvolvendo).
  //mainWindow.webContents.openDevTools()

 // Emitido quando a janela é fechada.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// Este método será chamado quando o Electron terminar a Inicialização
// e estiver pronto para criar janelas do navegador.
// Algumas APIs só podem ser utilizadas após esse evento ocorrer.
app.on('ready', createWindow)

// Sair quando todas as janelas estão fechadas.
app.on('window-all-closed', function () {
 // No OS X é comum para aplicações e sua barra de menu
 // permanecer ativo até que o usuário feche explicitamente a aplicação com Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
 // No OS X é comum para recriar uma janela no aplicativo quando o
 // Dock icon é clicado e não há outras janelas abertas.
  if (mainWindow === null) {
    createWindow()
  }
})


