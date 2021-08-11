import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FileService} from "../../../../shared/src/services/file/file.service";

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {

  constructor(private httpClient: HttpClient, private fileService: FileService) {
  }

  extractWebpage(url: string, filename?: string) {
    console.log('Attempting to extract from ', url);
    window.api.receive("app-extract-webpage-results", (data: any) => {
      console.log(`app-extract-webpage-results: ${data}`);
    });

    // Send message to Electron ipcMain
    let args: object = {
      url: url,
      filename: filename,
    }
    window.api.send("app-extract-webpage", args);
  }
}
