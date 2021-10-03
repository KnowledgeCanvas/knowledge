/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FileModel} from "projects/ks-lib/src/lib/models/file.model";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private files = new BehaviorSubject<FileModel[]>([]);
  public fileList = this.files.asObservable();

  constructor() {
    let files = window.localStorage.getItem('kc-files');
    if (files)
      this.files.next(JSON.parse(files));
  }

  getFiles() {
    let files = window.localStorage.getItem('kc-files');
    if (files)
      this.files.next(JSON.parse(files));
    return this.files.value;
  }

  list(): Promise<KnowledgeSource[]> {
    return new Promise<any>((resolve) => {
      let list = window.localStorage.getItem('kc-knowledge-sources')
      if (list) {
        let files = JSON.parse(list);
        resolve(files);
      }
    });
  }

}
