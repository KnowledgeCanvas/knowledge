import {Injectable} from '@angular/core';
import {UuidModel} from '../../../../../shared/src/models/uuid.model';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

declare global {
  interface Window {
    api?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UuidService {
  private uuidBuffer: UuidModel[] = [];
  private NUM_IDS = 128;
  private MIN_IDS = 16;

  constructor(private ipcService: ElectronIpcService) {
    this.asyncGenerate();
  }

  generate(quantity: number): UuidModel[] {
    if (quantity < 1) {
      console.error('Requested less than 1 UUID.. which is invalid...');
      return [];
    }

    let uuids: UuidModel[] = this.uuidBuffer.slice(0, quantity);
    this.uuidBuffer = this.uuidBuffer.slice(quantity);
    if (this.uuidBuffer.length <= 32) {
      this.asyncGenerate();
    }
    return uuids;
  }

  private asyncGenerate() {
    this.ipcService.generateUuid(128).then((ids: UuidModel[]) => {
      if (ids)
        this.uuidBuffer = ids;
    });
  }
}
