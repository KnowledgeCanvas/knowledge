import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {FileService} from "../../../../../shared/src/services/file/file.service";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {FileModel} from "../../../../../shared/src/models/file.model";
import {MatDialogRef} from "@angular/material/dialog";
import {UuidService} from "../../../../../shared/src/services/uuid/uuid.service";
import {FaviconExtractorService} from "../../../../../shared/src/services/favicon/favicon-extractor.service";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {UuidModel} from "../../../../../shared/src/models/uuid.model";
import {
  KnowledgeSource,
  KnowledgeSourceReference,
  SourceModel
} from "../../../../../shared/src/models/knowledge.source.model";
import {ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @ViewChild("fileDropRef", {static: false}) fileDropEl: ElementRef;
  parentId = '';
  files: File[] = [];
  fileNames: string[] = [];
  destination: 'project' | 'queue' = 'queue';

  constructor(fb: FormBuilder,
              private fileService: FileService,
              private projectService: ProjectService,
              private dialogRef: MatDialogRef<any>,
              private uuidService: UuidService,
              private faviconService: FaviconExtractorService,
              private ksQueueService: KsQueueService) {
    this.fileDropEl = new ElementRef(null);

    this.projectService.currentProject.subscribe((project) => {
      this.parentId = project.id.value ? project.id.value : '';
    })
  }

  ngOnInit(): void {
  }

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
    let uuids: UuidModel[] = this.uuidService.generate(this.files.length);
    let ksList: KnowledgeSource[] = [];

    for (let i = 0; i < this.files.length; i++) {
      const file = new FileModel(this.files[i].name, this.files[i].size, (this.files[i] as any).path, uuids[i]);
      const source = new SourceModel(file, undefined, undefined);
      const link = file.path;
      const ref = new KnowledgeSourceReference('file', source, link);
      let ks = new KnowledgeSource(file.filename, uuids[i], 'file', ref);
      ks.fileItem = file;
      ks.iconUrl = this.faviconService.file();
      ks.icon = this.faviconService.file();
      ksList.push(ks);
    }

    if (this.destination === 'queue')
      this.ksQueueService.enqueue(ksList);
    else {
      let projectUpdate: ProjectUpdateRequest = {
        id: new UuidModel(this.parentId),
        addKnowledgeSource: ksList
      }
      this.projectService.updateProject(projectUpdate);
    }
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}
