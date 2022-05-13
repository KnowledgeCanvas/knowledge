import { UUID } from "./uuid";
export declare class FileModel {
    filename: string;
    size: number;
    path: string;
    id: UUID;
    type: string;
    private accessTime;
    private modificationTime;
    private creationTime;
    constructor(filename: string, size: number, path: string, id: UUID, type: string);
}
