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

import { Injectable } from '@angular/core';
import { ElectronIpcService } from './electron-ipc.service';
import { UUID } from '@shared/models/uuid.model';

declare global {
  interface Window {
    api?: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class UuidService {
  private uuidBuffer: UUID[] = [];

  constructor(private ipcService: ElectronIpcService) {
    this.asyncGenerate();
  }

  generate(quantity: number): UUID[] {
    if (quantity < 1) {
      console.error('Requested less than 1 UUID.. which is invalid...');
      return [];
    }

    const uuids: UUID[] = this.uuidBuffer.slice(0, quantity);
    this.uuidBuffer = this.uuidBuffer.slice(quantity);
    if (this.uuidBuffer.length <= 32) {
      this.asyncGenerate();
    }
    return uuids;
  }

  private asyncGenerate() {
    this.ipcService.generateUuid(128).then((ids: UUID[]) => {
      if (ids) this.uuidBuffer = ids;
    });
  }
}
