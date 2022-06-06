export interface BrowserViewHeaderConfig {
    showOpenButton?: boolean;
    canClose?: boolean;
    canCopy?: boolean;
    canGoBack?: boolean;
    canGoForward?: boolean;
    canRefresh?: boolean;
    canSave?: boolean;
    displayText?: string;
    displayTextReadOnly?: boolean;
    customClass?: string | string[];
    backgroundColor?: string;
    showSaveButton?: boolean;
    showNavButtons?: boolean;
    showActionButtons?: boolean;
    showDisplayText?: boolean;
    showCloseButton?: boolean;
}
export interface BrowserViewHeaderEvent {
    backClicked?: boolean;
    forwardClicked?: boolean;
    refreshClicked?: boolean;
    closeClicked?: boolean;
    copyClicked?: boolean;
    saveClicked?: boolean;
    openClicked?: boolean;
}
export interface FileViewConfig {
    filePath: string;
    isDialog?: true;
}
export interface FileViewClickEvent extends BrowserViewHeaderEvent {
}
export interface BrowserViewConfig {
    url: URL;
    isDialog?: true;
    canSave?: true;
}
export interface BrowserViewNavEvent {
    urlChanged?: true;
    url?: URL;
}
export interface BrowserViewClickEvent extends BrowserViewHeaderEvent {
}
