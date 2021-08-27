import * as fs from 'fs';
import {EnvironmentModel} from "../model/environment.model";

let os = require('os');
let path = require('path');
let dotenv = require('dotenv');


const RET_OK = 0;
const RET_ERR = -1;
const appTitle = 'KnowledgeCanvas';
const homeDir = os.homedir();
const appPath = path.join(homeDir, '.' + appTitle);
const filesPath = path.join(appPath, 'files');
const pdfPath = path.join(filesPath, 'pdfs');
const resources = path.join(process.cwd(), 'resources');
const envPath = path.resolve(resources, 'app.env');
const projectsPath = path.join(appPath, 'Projects');

// ApplicationEnvironment is a singleton class that serves as the ground-truth environment settings
export class ApplicationEnvironment {
    private static appEnv: EnvironmentModel;
    private static instance: ApplicationEnvironment;


    constructor() {
        console.log('Setting up Application Environment...');
        ApplicationEnvironment.setDefaults();
        ApplicationEnvironment.loadEnvironment();
        ApplicationEnvironment.loadHostOs();
        ApplicationEnvironment.loadFile();
        ApplicationEnvironment.checkPaths();
        console.log('Application Environment Good...');
    }

    public static getInstance(): ApplicationEnvironment {
        if (!ApplicationEnvironment.instance) {
            ApplicationEnvironment.instance = new ApplicationEnvironment();
        }

        return ApplicationEnvironment.instance;
    }

    private static setDefaults() {
        this.appEnv = {
            appPath: appPath,
            appTitle: appTitle,
            cwd: process.cwd(),
            envPath: envPath,
            filesPath: filesPath,
            pdfPath: pdfPath,
            error: '',
            firstRun: true,
            homeDir: homeDir,
            pathSep: path.sep,
            projectsPath: projectsPath,
            serverPath: __dirname,
            settingsFilename: 'knowledge-canvas.settings.json',
            settingsFilePath: '',
            settingsPath: ''
        };
    }

    private static loadEnvironment(filePath?: string) {
        filePath = filePath ? filePath : this.appEnv.envPath
        let env = dotenv.config({path: filePath});
        if (env.error) {
            console.error('Error attempting to read app.env: ', env.error);
        } else {
            this.appEnv = {
                ...this.appEnv,
                ...env.parsed
            }
        }
    }

    private static loadHostOs() {
        this.appEnv.settingsPath = '';
        switch (process.platform) {
            case "darwin": // MacOS -- /Users/username/Library/Preferences/KnowledgeCanvas
                this.appEnv.settingsPath = path.join(os.homedir(), 'Library', 'Preferences', this.appEnv.appTitle);
                break;
            case "linux": // Ubuntu -- ~/.local/share/KnowledgeCanvas
                this.appEnv.settingsPath = path.join(os.homedir(), '.local', 'share', this.appEnv.appTitle);
                break;
            case "win32": // Windows -- C: Users\username\AppData\Local\KnowledgeCanvas
                this.appEnv.settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', this.appEnv.appTitle);
                break;
            default:
                console.error('Settings directory not configured properly. Shutting down.');
                process.exit(-1);
        }

        this.appEnv.settingsFilePath = path.join(this.appEnv.settingsPath, this.appEnv.settingsFilename);
    }

    private static loadFile() {
        let filePath = this.appEnv.settingsFilePath;
        let settings = null;

        try {
            let raw = fs.readFileSync(filePath);
            settings = JSON.parse(raw.toString());
            this.appEnv = {
                ...this.appEnv,
                ...settings
            };
        } catch (e) {
            console.warn('Read from settings file unsuccessful. Creating new settings file.');
            if (makeDirectory(this.appEnv.settingsPath) !== RET_OK) {
                console.error('Exiting with code ', -1);
                process.exit(-1);
            }
            let data = JSON.stringify(this.appEnv);
            if (writeFile(filePath, data) !== RET_OK) {
                console.error('Exiting with code ', -1);
                process.exit(-1);
            }
        }
    }

    private static checkPaths() {
        for (let pathToCheck of [
            appPath,
            filesPath,
            pdfPath,
            projectsPath
        ]) {
            if (makeDirectory(pathToCheck) !== RET_OK)
                console.error('Unexpected error while attempting to create directory: ', pathToCheck);
        }
    }

    public getEnvironment(): EnvironmentModel {
        return ApplicationEnvironment.appEnv;
    }
}


function writeFile(dir: string, data: any) {
    dir = path.join(dir);
    try {
        fs.writeFileSync(dir, data);
        return RET_OK;
    } catch (e) {
        console.error('Could not write settings file: ', dir);
        console.error(e);
        return RET_ERR;
    }
}


function makeDirectory(dir: string) {
    dir = path.resolve(dir);
    try {
        fs.mkdirSync(dir, {recursive: true});
        return RET_OK;
    } catch (e) {
        console.error(e);
        return RET_ERR;
    }
}

module.exports = ApplicationEnvironment;
