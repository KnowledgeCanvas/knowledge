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
