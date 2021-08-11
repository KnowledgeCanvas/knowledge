import {Injectable} from '@angular/core';
import {FileModel} from "../../models/file.model";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor() {
  }

  uploadFile(files: File[], projectId?: string) {
    for (let file of files) {
      let tmp: FileModel = {
        filename: file.path,
        size: file.size,
        title: file.name,
        ingestType: 'file'
      }
      window.localStorage.setItem(`${window.localStorage.length}`, JSON.stringify(tmp))
    }
  }

  getFiles() {
    for (let i = 0; i < window.localStorage.length; i++) {
      console.log(`localStorage entry ${i + 1}: `, window.localStorage.getItem(`${i}`));
    }
  }

  list(): Promise<any> {
    return new Promise<any>((resolve) => {
      let files = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        let tmp;
        let entry = window.localStorage.getItem(`${i}`);
        if (entry)
          tmp = JSON.parse(entry);
        files.push(tmp);
      }
      resolve(files);
    });
  }

}
