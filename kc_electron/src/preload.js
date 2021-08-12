const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
                "app-search-python", 
                "app-extract-webpage", 
                "app-generate-uuid",
                "app-get-settings",
                "app-save-settings"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                "app-search-python-results", 
                "app-extract-webpage-results",
                "app-generate-uuid-results",
                "app-get-settings-results",
                "app-save-settings-results"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {

});
