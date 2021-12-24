export interface EnvironmentModel {
    DEFAULT_WINDOW_HEIGHT?: number;
    DEFAULT_WINDOW_WIDTH?: number;
    STARTUP_WINDOW_HEIGHT?: number;
    STARTUP_WINDOW_WIDTH?: number;
    appPath: string;
    appTitle: string;
    cwd: string;
    display: any;
    dockerDirectoryPath?: string;
    envPath?: string;
    error?: string;
    filesPath?: string;
    firstRun: boolean;
    homeDir?: string;
    ingest?: any;
    pathSep: string;
    pdfPath: string;
    projectsPath: string;
    search?: any;
    serverPath: string;
    settingsFilePath: string;
    settingsFilename: string;
    settingsPath: string;
    wellness?: any;
    app?: any;
}
