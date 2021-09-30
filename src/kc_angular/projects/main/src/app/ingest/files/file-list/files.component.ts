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

import {Component, OnInit} from '@angular/core';
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {FileModel} from "projects/ks-lib/src/lib/models/file.model";
import {FileService} from "../../../../../../ks-lib/src/lib/services/file/file.service";
import {StorageService} from "../../../../../../ks-lib/src/lib/services/storage/storage.service";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  ksList: KnowledgeSource[] = [];
  files: FileModel[] = [];

  constructor(private fileService: FileService, private storageService: StorageService) {
    this.ksList = storageService.ksList;
    for (let ks of this.ksList) {
      if (ks.reference.source.file) {
        this.files.push(ks.reference.source.file)
      }
    }
  }

  ngOnInit(): void {
  }

  openFile(id: UuidModel) {
    let file = this.files.find(f => f.id.value === id.value);
    if (file)
      window.open(file.path);
  }

  removeFile(id: UuidModel) {
    console.warn('Removing file with ID: ', id);
  }
}
