const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow() {
    console.log(__dirname)
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'kc-electron', 'dist', 'preload.js')
        }
    })
    win.loadFile('kc-app/index.html')
}

app.whenReady().then(() => {
    createWindow()
})


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
