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

  private async asyncGenerate() {
    window.api.receive("app-generate-uuid-results", (data: []) => {
      for (let id of data) {
        this.uuidBuffer.push(new UuidModel(id));
      }
    });
    window.api.send("app-generate-uuid", {quantity: 64});
  }
}
