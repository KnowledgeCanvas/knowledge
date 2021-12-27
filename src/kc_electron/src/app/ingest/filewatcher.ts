/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

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
