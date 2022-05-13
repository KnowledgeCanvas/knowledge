import {Injectable} from '@angular/core';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  constructor(private ipcService: ElectronIpcService) {
    this.ipcService.version.subscribe((version) => {
      if (!version || version === '') {
        return;
      }

      console.log(`Application version: ${version}`);
    });

    this.ipcService.getCurrentVersion();
  }

}
