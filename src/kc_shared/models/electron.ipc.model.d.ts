import { KnowledgeSource } from "./knowledge.source.model";
export interface IpcSuccess {
    message?: string;
    data?: any;
}
export interface IpcError {
    code: number;
    label: string;
    message: string;
}
export interface IpcMessage {
    error: IpcError | undefined;
    success: IpcSuccess | undefined;
}
export interface UuidRequest {
    quantity: number;
}
export interface BrowserViewRequest {
    url: string;
    x: number;
    y: number;
    height: number;
    width: number;
    returnHtml?: boolean;
}
export interface BrowserViewResponse {
    html: string;
    backgroundColor: string;
}
export interface DialogRequest {
    ksList: KnowledgeSource[];
}
export interface ThumbnailRequest {
    path: string;
    width?: number;
    height?: number;
    id?: string;
}
export interface PromptForDirectoryRequest {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: FileFilter[];
    properties?: PromptForDirectoryProperties[];
    message?: string;
    securityScopedBookmarks?: boolean;
}
export declare type PromptForDirectoryProperties = 'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent';
export declare type FileFilter = {
    name: string;
    extensions: string[];
};
