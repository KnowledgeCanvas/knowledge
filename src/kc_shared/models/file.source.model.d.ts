import { UuidModel } from "./uuid.model";
export interface FileSourceModel {
    filename: string;
    size: number;
    path: string;
    id: UuidModel;
    type: string;
    accessTime: string;
    modificationTime: string;
    creationTime: string;
    pages?: number;
    words?: number;
}
export interface FileWatcherUpdate {
    id: string;
    method: 'add' | 'remove' | 'delay';
}
export interface PendingFileTransfer {
    id: string;
    oldPath: string;
    newPath: string;
}