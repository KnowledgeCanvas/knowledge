const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
                "app-search-python",
                "app-extract-website",
                "app-generate-uuid",
                "app-get-settings",
                "app-save-settings",
                "electron-browser-view",
                "electron-browser-view-file",
                "electron-close-browser-view"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                "app-search-python-results",
                "app-extract-website-results",
                "app-generate-uuid-results",
                "app-get-settings-results",
                "app-save-settings-results",
                "electron-browser-view-results",
                "electron-browser-view-file-results"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {

});
