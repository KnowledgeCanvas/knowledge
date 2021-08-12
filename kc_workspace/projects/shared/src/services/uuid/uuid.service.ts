import { Injectable } from '@angular/core';
import { UuidModel } from '../../models/uuid.model';

declare global {
  interface Window {
    api?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UuidService {

  constructor() {}
  generate(quantity?: number): Promise<UuidModel[]> {
    quantity = quantity ? quantity : 1;

    return new Promise<UuidModel[]>((resolve) => {
      window.api.receive("app-generate-uuid-results", (data: []) => {
        let uuids: UuidModel[] = [];
        for (let id of data) {
          console.log('UUID: ', id);
          uuids.push(new UuidModel(id));
        }
        resolve(uuids);
      });
      window.api.send("app-generate-uuid", {quantity: quantity});
    });
  }
}
