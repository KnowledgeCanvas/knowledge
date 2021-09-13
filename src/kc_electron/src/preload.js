const {contextBridge, ipcRenderer} = require('electron');

// whitelist channels
const validSendChannels = [
    "app-extract-website",
    "app-generate-uuid",
    "app-get-settings",
    "app-prompt-for-directory",
    "app-save-settings",
    "electron-check-for-update",
    "app-get-current-version",
    "electron-browser-view",
    "electron-browser-view-can-go-back",
    "electron-browser-view-can-go-forward",
    "electron-browser-view-current-url",
    "electron-browser-view-file",
    "electron-browser-view-go-back",
    "electron-browser-view-go-forward",
    "electron-close-browser-view",
    'electron-browser-view-refresh',
    'electron-get-file-icon',
    'electron-get-file-thumbnail',
    'electron-open-local-file',
];
const validReceiveOnceChannels = [
    "app-extract-website-results",
    "app-generate-uuid-results",
    "app-get-settings-results",
    "app-prompt-for-directory-results",
    "app-save-settings-results",
    "electron-browser-view-file-results",
    "electron-browser-view-results",
    "electron-close-browser-view-results",
    'electron-get-file-icon-results',
    'electron-get-file-thumbnail-results',
    'electron-open-local-file-results',
];
const validReceiveChannels = [
    "app-chrome-extension-results",
    "app-ingest-watcher-results",
    "electron-auto-update",
    "app-get-current-version-results",
    "electron-browser-view-can-go-back-results",
    "electron-browser-view-can-go-forward-results",
    "electron-browser-view-current-url-results",
    "electron-browser-view-nav-events"
]

contextBridge.exposeInMainWorld(
    'api', {
        send: (channel, data) => {
            if (validSendChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            } else {
                console.error('IPC.send invalid channel: ', channel);
            }
        },
        receive: (channel, func) => {
            if (validReceiveChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            } else {
                console.error('IPC.receive invalid channel: ', channel);
            }
        },
        receiveOnce: (channel, func) => {
            if (validReceiveOnceChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            } else {
                console.error('IPC.receiveOnce invalid channel: ', channel);
            }
        },
        removeAllListeners: (channel) => {
            ipcRenderer.removeAllListeners(channel);
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {

});
