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

import { IpcChannelInterface } from "../local/utils/ipc.utils";
import { IpcMainEvent } from "electron";
import { IpcRequest } from "../../../kc_shared/models/electron.ipc.model";

export class ChatPrinterIpc implements IpcChannelInterface {
  getName(): string {
    return "ChatPrinter";
  }

  handle(event: IpcMainEvent, request: IpcRequest): void {
    console.log("Chat printer handler", event, request);
  }

  private async createContainer(height: number, width: number, doc: Document) {
    const container = doc.createElement("div");
    container.style.display = "block";
    container.style.height = `${height}px`;
    container.style.width = `${width}px`;
  }
}
