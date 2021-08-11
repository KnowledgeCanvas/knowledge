const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["app-search-python", "app-extract-webpage"];
            if (validChannels.includes(channel)) {
                console.log('Received incoming "send" command - Forwarding...');
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["app-search-python-results", "app-extract-webpage-results"];
            if (validChannels.includes(channel)) {
                console.log('Received incoming "receive" command - Forwarding...');
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {

});
