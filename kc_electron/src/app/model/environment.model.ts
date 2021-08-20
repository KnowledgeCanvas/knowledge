export interface EnvironmentModel {
    appPath: string;
    appTitle: string;
    cwd: string;
    envPath?: string;
    error?: string;
    filesPath?: string;
    firstRun: boolean;
    homeDir?: string;
    pathSep: string;
    pdfPath: string;
    projectsPath: string;
    serverPath: string;
    settingsFilePath: string;
    settingsFilename: string;
    settingsPath: string;
    dockerDirectoryPath?: string;
    DEFAULT_WINDOW_HEIGHT?: number;
    DEFAULT_WINDOW_WIDTH?: number;
    STARTUP_WINDOW_HEIGHT?: number;
    STARTUP_WINDOW_WIDTH?: number;
}
