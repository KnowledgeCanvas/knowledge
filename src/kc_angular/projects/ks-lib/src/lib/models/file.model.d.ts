import { UuidModel } from "./uuid.model";
export declare class FileModel {
    filename: string;
    size: number;
    path: string;
    id: UuidModel;
    type: string;
    private accessTime;
    private modificationTime;
    private creationTime;
    constructor(filename: string, size: number, path: string, id: UuidModel, type: string);
}
