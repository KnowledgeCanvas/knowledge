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

import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FileModel} from "projects/ks-lib/src/lib/models/file.model";

@Component({
  selector: 'ks-lib-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent implements OnInit {
  @ViewChild("fileDropRef", {static: false}) fileDropEl: ElementRef;
  @Output() files = new EventEmitter<FileModel[]>();
  fileList: File[] = [];
  fileModelList: FileModel[] = [];
  fileNames: string[] = [];

  constructor() {
    this.fileDropEl = new ElementRef(null);
  }

  ngOnInit(): void {
  }

  submit() {
    this.files.emit(this.fileModelList);
  }

  onFileDropped($event: any) {
    for (const item of $event) {
      this.fileList.push(item);
    }
  }

  fileBrowseHandler(event: any) {
    for (const item of event.target.files) {
      this.fileList.push(item);
    }
    this.fileDropEl.nativeElement.value = "";
  }

  deleteFile(index: number) {
    this.fileList.splice(index, 1);
  }

  cancel() {
    // this.dialogRef.close();
  }
}
