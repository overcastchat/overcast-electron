const { app, BrowserWindow } = require('electron')
var win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, frame: false })

  // and load the index.html of the app.
  win.loadFile('./src/index.html')
}

app.on('ready', createWindow)