import {Injectable} from '@angular/core';

declare global {
  interface Window {
    api?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class KsLibService {

  constructor() {
  }
}
