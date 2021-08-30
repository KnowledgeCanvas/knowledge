import {SettingsModel} from "../model/settings.model";

export declare class StartupService {
    appEnv: SettingsModel;

    constructor();

    start(appEnv: SettingsModel): void;

    checkPaths(): void;
}
