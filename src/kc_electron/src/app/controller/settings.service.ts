import * as fs from 'fs';
import {EnvironmentModel} from "../models/environment.model";
import {BehaviorSubject} from 'rxjs';

const RET_OK = 0;
const RET_FAIL = -1;

let GLOBAL_ERROR = '';

const ApplicationEnvironment = require('./environment');
let appEnv: EnvironmentModel;
appEnv = new ApplicationEnvironment().getEnvironment();


class SettingsService {
    private ingestSubject = new BehaviorSubject<any>({});
    ingest = this.ingestSubject.asObservable();

    constructor() {
    }

    getSettings() {
        let settings;

        try {
            let raw = fs.readFileSync(appEnv.settingsFilePath, 'utf8');
            settings = JSON.parse(raw.toString());
            // console.log('Settings retrieved from file (', appEnv.settingsPath, '): ', settings);
        } catch (e) {
            console.error('SettingsService: File IO error occurred on read.');
            console.error(e);
        }

        // TODO: Filter the settings that we don't want to expose in a more systematic way
        delete settings.googleApiKey;

        appEnv = {
            ...appEnv,
            ...settings
        };

        if (appEnv.ingest) {
            this.ingestSubject.next(appEnv.ingest);
        }

        return appEnv;
    }

    /**
     *
     * @param settings : Object
     * @returns {number | error}
     */
    async setSettings(settings: EnvironmentModel): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.verifySettings(settings) === RET_OK) {
                let oldIngestSettings = appEnv.ingest;
                let newIngestSettings = settings.ingest;

                console.log('Settings verified: ', settings);
                appEnv = {
                    ...appEnv,
                    ...settings
                };
                this.writeSettings();


                if (settings.ingest && (oldIngestSettings.autoscan !== newIngestSettings.autoscan
                    || oldIngestSettings.autoscanLocation !== newIngestSettings.autoscanLocation
                    || oldIngestSettings.interval !== newIngestSettings.interval)) {
                    this.ingestSubject.next(appEnv.ingest);
                }

                resolve(appEnv);
            } else {
                GLOBAL_ERROR = 'Invalid startup settings. Be sure to include the minimum set of settings (see documentation).';
                console.error(GLOBAL_ERROR);
                reject(GLOBAL_ERROR);
            }
        });
    }

    async writeSettings(): Promise<any> {
        // First attempt to create the settings directory.
        // Ignore if it already exists and return error if creation fails.
        return new Promise((resolve, reject) => {
            try {
                fs.mkdirSync(appEnv.settingsPath, {recursive: true});
            } catch (e) {
                console.error('Unable to create: ', appEnv.settingsPath, e);
                GLOBAL_ERROR = 'Could not create settings directory: ' + appEnv.settingsPath;
                reject({GLOBAL_ERROR});
            }

            try {
                console.log('Writing settings file to: ', appEnv.settingsPath);
                let settings = JSON.stringify(appEnv);
                fs.writeFileSync(appEnv.settingsFilePath, settings);
                return RET_OK;
            } catch (e) {
                GLOBAL_ERROR = 'Could not write startup settings: ' + appEnv.settingsFilePath;
                return RET_FAIL;
            }
        });
    }

    verifySettings(settings: EnvironmentModel) {
        // TODO: figure out a better verification scheme... define what constitutes "required" settings
        return RET_OK;
    }

}

let settingsService = new SettingsService();
module.exports = settingsService;
