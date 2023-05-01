/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
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
  method: "add" | "remove" | "delay";
}

export interface PendingFileTransfer {
  id: string;
  filename: string;
  oldPath: string;
  newPath: string;
}
