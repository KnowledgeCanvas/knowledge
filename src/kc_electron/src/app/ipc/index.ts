const fileIpc = require('./ipc-files');
const browserIpc = require('./ipc-browser');
const {miscIpc} = require('./ipc-misc');
const autoUpdateIpc = require('./ipc-auto-update');

module.exports = {
    autoUpdateIpc,
    fileIpc,
    browserIpc
}
