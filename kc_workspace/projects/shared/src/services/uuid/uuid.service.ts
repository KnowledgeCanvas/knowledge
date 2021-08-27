import {Injectable} from '@angular/core';
import {UuidModel} from '../../models/uuid.model';

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

  constructor() {
    this.asyncGenerate();
  }

  generate(quantity: number): UuidModel[] {
    if (quantity < 1) {
      console.error('Requested less than 1 UUID.. which is invalid...');
      return [];
    }

    let uuids: UuidModel[] = this.uuidBuffer.slice(0, quantity);
    this.uuidBuffer = this.uuidBuffer.slice(quantity);

    if (this.uuidBuffer.length <= 16) {
      this.asyncGenerate();
    }

    return uuids;
  }

  private asyncGenerate() {
    window.api.receive("app-generate-uuid-results", (response: any) => {
      if (response.error || !response.success.data) {
        console.error('Unable to get UUIDs from IPC.');
        console.error(response.error);
        throw new Error(response.error);
      }
      for (let id of response.success.data) {
        let uuid = new UuidModel(id);
        this.uuidBuffer.push(uuid);
      }
    });
    window.api.send("app-generate-uuid", {quantity: 64});
  }
}
