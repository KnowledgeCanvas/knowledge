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
}
export interface KsThumbnailRequest {
    path: string;
    width?: number;
    height?: number;
}
