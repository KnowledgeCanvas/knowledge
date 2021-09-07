export interface IpcSuccess {
    message?: string;
    data?: any;
}
export interface IpcError {
    code: number;
    label: string;
    message: string;
}
export interface IpcResponse {
    error: IpcError | undefined;
    success: IpcSuccess | undefined;
}
export interface KcUuidRequest {
    quantity: number;
}
export interface KsBrowserViewRequest {
    url: string;
    x: number;
    y: number;
    height: number;
    width: number;
    returnHtml?: boolean;
}
export interface KsBrowserViewResponse {
    html: string;
    backgroundColor: string;
}
export interface KsThumbnailRequest {
    path: string;
    width?: number;
    height?: number;
}
export interface PromptForDirectoryRequest {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: any[];
    properties?: PromptForDirectoryProperties[];
    macOsMessage?: string[];
    macOsSecurityScopedBookmarks?: boolean;
}
export declare type PromptForDirectoryProperties = 'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent';
