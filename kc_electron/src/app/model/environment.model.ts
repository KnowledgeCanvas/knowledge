export interface EnvironmentModel {
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    appPath: string;
    appTitle: string;
    cwd: string;
    envPath?: string;
    error?: string;
    firstRun: boolean;
    homeDir?: string;
    jdkBinaryPath?: string
    jdkLin?: string;
    jdkMac?: string;
    jdkPath?: string;
    jdkWin?: string;
    pathSep: string;
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
