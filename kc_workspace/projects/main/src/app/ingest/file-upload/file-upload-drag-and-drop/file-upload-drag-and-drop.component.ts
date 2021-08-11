// Adapted from: https://medium.com/@tarekabdelkhalek/how-to-create-a-drag-and-drop-file-uploading-in-angular-78d9eba0b854
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FileService} from "../../../../../../shared/src/services/file/file.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-file-upload-drag-and-drop',
  templateUrl: './file-upload-drag-and-drop.component.html',
  styleUrls: ['./file-upload-drag-and-drop.component.scss']
})
export class FileUploadDragAndDropComponent implements OnInit {
  @ViewChild("fileDropRef", {static: false}) fileDropEl: ElementRef;
  files: File[] = [];

  constructor(private fileService: FileService, private dialogRef: MatDialogRef<any>) {
    this.fileDropEl = new ElementRef(null);
  }

  ngOnInit(): void {
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: any) {
    for (const item of event.target.files) {
      this.files.push(item);
    }
    this.fileDropEl.nativeElement.value = "";
  }

  onFileDropped($event: any) {
    for (const item of $event) {
      this.files.push(item);
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  submit() {
    console.log('Submitting with files: ', this.files);
    let fileList: File[] = [];

    this.fileService.uploadFile(this.files)

    this.fileService.getFiles();

    this.dialogRef.close();
  }
}
