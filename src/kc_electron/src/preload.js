const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
                "app-extract-website",
                "app-generate-uuid",
                "app-get-settings",
                "app-save-settings",
                "app-prompt-for-directory",
                "electron-browser-view",
                "electron-browser-view-file",
                "electron-close-browser-view",
                'electron-open-local-file',
                'electron-get-file-icon',
                'electron-get-file-thumbnail'
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                "app-extract-website-results",
                "app-generate-uuid-results",
                "app-get-settings-results",
                "app-prompt-for-directory-results",
                "app-save-settings-results",
                "electron-browser-view-results",
                "electron-browser-view-file-results",
                'electron-get-file-icon-results',
                'electron-get-file-thumbnail-results',
                'electron-open-local-file-results',
            ];
            let validAlwaysChannels = [
                "app-chrome-extension-results",
                "app-ingest-watcher-results"
            ]
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
            if (validAlwaysChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {

});
