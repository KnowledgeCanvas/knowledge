import {IngestSettingsModel} from "../models/ingest.model";
import {Subscription} from 'rxjs';
import {FSWatcher} from "chokidar";

const chokidar = require('chokidar');


const settingsService = require('../controller/settings.service');

// TODO: give file watcher its own thread so it doesn't affect the main process


class IngestFileWatcher {
    ingestWatcher: FSWatcher | null = null;
    ingestSubscription: Subscription;
    interval: any = undefined;
    queue: any[] = [];

    constructor() {
        this.ingestSubscription = settingsService.ingest.subscribe((ingest: IngestSettingsModel) => {
            // Disable file watcher if autoscan is false
            if (!ingest.autoscan) {
                console.log('Autoscan has been disabled... closing ingestWatcher');

                if (this.ingestWatcher) {
                    this.ingestWatcher.close().then((_: any) => {
                        console.log('Closing ingest file watcher...');
                    }).catch((reason) => {
                        console.warn('Ingest file watcher failed to close... ', reason);
                    });


                }

                clearInterval(this.interval);
                this.ingestWatcher = null;
                this.queue = [];
                return;
            }
        });
    }

    reset() {
        clearInterval(this.interval);
        this.ingestWatcher = null;
        this.queue = [];
    }

    stop() {

    }

    start() {

    }

    setWatcher(watchPath: string) {
        this.ingestWatcher = chokidar.watch(watchPath, {
            // intended behavior: ignore dotfiles
            ignored: /(^|[\/\\])\../,

            // intended behavior: keep the file watcher running as long as the user has 'Autoscan' enabled
            persistent: true,

            // intended behavior: if the user doesn't move the files, then we shouldn't touch them and show them next time
            ignoreInitial: false
        });
    }
}


module.exports = {}
