// Adapted from: https://medium.com/@tarekabdelkhalek/how-to-create-a-drag-and-drop-file-uploading-in-angular-78d9eba0b854
import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FileService} from "../../../../../../shared/src/services/file/file.service";
import {MatDialogRef} from "@angular/material/dialog";
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {KnowledgeSourceModel} from "../../../../../../shared/src/models/knowledge.source.model";
import {FileModel} from "../../../../../../shared/src/models/file.model";
import {ProjectUpdateRequest} from "../../../../../../shared/src/models/project.model";
import {UuidModel} from "../../../../../../shared/src/models/uuid.model";
import {UuidService} from "../../../../../../shared/src/services/uuid/uuid.service";
import {FaviconExtractorService} from "../../../../../../shared/src/services/favicon/favicon-extractor.service";

@Component({
  selector: 'app-file-upload-drag-and-drop',
  templateUrl: './file-upload-drag-and-drop.component.html',
  styleUrls: ['./file-upload-drag-and-drop.component.scss']
})
export class FileUploadDragAndDropComponent implements OnInit, OnChanges {
  @ViewChild("fileDropRef", {static: false}) fileDropEl: ElementRef;
  @Input() parentId: string = '';
  files: File[] = [];

  constructor(private fileService: FileService,
              private dialogRef: MatDialogRef<any>,
              private projectService: ProjectService,
              private uuidService: UuidService,
              private faviconService: FaviconExtractorService) {
    this.fileDropEl = new ElementRef(null);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.parentId.currentValue) {
      console.log('Parent ID set to : ', this.parentId);
    }
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
    let uuids: UuidModel[] = this.uuidService.generate(this.files.length);
    let ksList: KnowledgeSourceModel[] = [];

    for (let i = 0; i < this.files.length; i++) {
      let file = new FileModel(this.files[i].name, this.files[i].size, (this.files[i] as any).path, uuids[i]);
      let ks = new KnowledgeSourceModel(file.filename, uuids[i], 'file');
      ks.fileItem = file;
      ks.iconUrl = this.faviconService.file();
      ks.icon = this.faviconService.file();
      ksList.push(ks);
    }

    let projectUpdate: ProjectUpdateRequest = {
      id: new UuidModel(this.parentId),
      addKnowledgeSource: ksList
    }

    this.projectService.updateProject(projectUpdate);

    this.dialogRef.close();
  }
}
