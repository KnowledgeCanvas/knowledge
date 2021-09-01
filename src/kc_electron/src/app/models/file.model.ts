export interface FileModel {
    filename: string;
    size: number;
    path: string;
    id: { value: string };
    type: string;
    accessTime: string;
    modificationTime: string;
    creationTime: string;
}
