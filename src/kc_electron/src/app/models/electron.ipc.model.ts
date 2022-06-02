/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {KnowledgeSource} from "kc_knowledge/src/knowledge/knowledge-canvas";

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

export interface KcUuidRequest {
    quantity: number
}

export interface KsBrowserViewRequest {
    url: string,
    x: number,
    y: number,
    height: number,
    width: number,
    returnHtml?: boolean
}

export interface KsBrowserViewResponse {
    html: string,
    backgroundColor: string
}

export interface KcDialogRequest {
    ksList: KnowledgeSource[]
}

export interface KsDialogResponse {

}

export interface KsThumbnailRequest {
    path: string,
    width?: number,
    height?: number,
    id?: string
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

export type PromptForDirectoryProperties = 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
