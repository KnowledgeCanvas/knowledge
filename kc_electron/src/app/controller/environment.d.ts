import { EnvironmentModel } from "../model/environment.model";
export declare class ApplicationEnvironment {
    private static appEnv;
    private static instance;
    constructor();
    static getInstance(): ApplicationEnvironment;
    getEnvironment(): EnvironmentModel;
    private static setDefaults;
    private static loadEnvironment;
    private static loadHostOs;
    private static loadFile;
}
