import { EnvironmentModel } from "../models/environment.model";
export declare class ApplicationEnvironment {
    private static appEnv;
    private static instance;
    constructor();
    static getInstance(): ApplicationEnvironment;
    private static setDefaults;
    private static loadEnvironment;
    private static loadHostOs;
    private static loadFile;
    private static checkPaths;
    getEnvironment(): EnvironmentModel;
}
