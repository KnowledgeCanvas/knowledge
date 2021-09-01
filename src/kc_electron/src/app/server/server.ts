let share: any = (global as any).share;
let http: any = share.http;
let ipcMain: any = share.ipcMain;
let BrowserWindow: any = share.BrowserWindow;
let url: any = share.url;

let createServer = () => {
    http.createServer((req: any, res: any) => {
        console.log('--------------------------------------------------------------------------------');
        console.log('Browser Extension Server - Link Received')
        console.log('Request: ', req.url);
        // console.log('Browser of origin: ', req.rawHeaders);
        // TODO: try to figure out which browsers the user has available for later use
        console.log('--------------------------------------------------------------------------------');
        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        let q = url.parse(req.url, true).query;

        if (q.link) {
            kcMainWindow.webContents.send('app-chrome-extension-results', q.link);
            res.end("Done");
        } else {
            console.error('Received invalid link from Chrome extension...');
            res.end('Failed');
        }
    }).listen(9000)
}

module.exports = {
    createServer
}




