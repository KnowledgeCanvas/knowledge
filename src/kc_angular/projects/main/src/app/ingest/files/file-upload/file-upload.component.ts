import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {FileService} from "../../../../../../ks-lib/src/lib/services/file/file.service";
import {ProjectIdentifiers, ProjectService} from "../../../../../../ks-lib/src/lib/services/projects/project.service";
import {FileModel} from "projects/ks-lib/src/lib/models/file.model";
import {MatDialogRef} from "@angular/material/dialog";
import {UuidService} from "../../../../../../ks-lib/src/lib/services/uuid/uuid.service";
import {FaviconExtractorService} from "../../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {KsQueueService} from "../../../knowledge-source/ks-queue-service/ks-queue.service";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {
  KnowledgeSource,
  KnowledgeSourceReference,
  SourceModel
} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ElectronIpcService} from "../../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnChanges {
  @ViewChild("fileDropRef", {static: false}) fileDropEl: ElementRef;
  @Input() currentProject: ProjectModel | undefined = undefined;
  parentId = '';
  files: File[] = [];
  fileNames: string[] = [];
  destination: 'project' | 'queue' = 'queue';
  projectIdentifiers: ProjectIdentifiers[] = [];

  constructor(fb: FormBuilder,
              private fileService: FileService,
              private projectService: ProjectService,
              private dialogRef: MatDialogRef<any>,
              private uuidService: UuidService,
              private faviconService: FaviconExtractorService,
              private ksQueueService: KsQueueService,
              private ipcService: ElectronIpcService) {
    this.fileDropEl = new ElementRef(null);
    this.projectIdentifiers = this.projectService.ProjectIdentifiers;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentProject.currentValue) {
      this.parentId = changes.currentProject.currentValue.id.value;
      this.projectIdentifiers = this.projectService.ProjectIdentifiers
    }
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
    let paths: any[] = [];

    for (let file of this.files) {
      paths.push((file as any).path)
    }

    this.ipcService.getFileIcon(paths).then((result) => {
      for (let i = 0; i < this.files.length; i++) {
        const file = new FileModel(this.files[i].name, this.files[i].size, (this.files[i] as any).path, uuids[i], this.files[i].type);
        const source = new SourceModel(file, undefined, undefined);
        const link = file.path;
        const ref = new KnowledgeSourceReference('file', source, link);
        let ks = new KnowledgeSource(file.filename, uuids[i], 'file', ref);
        ks.iconUrl = this.faviconService.file();
        ks.icon = result[i];
        ksList.push(ks);
      }

      if (this.destination === 'queue')
        this.ksQueueService.enqueue(ksList);
      else {
        let projectUpdate: ProjectUpdateRequest = {
          id: new UuidModel(this.parentId),
          addKnowledgeSource: ksList
        }
        console.log('Update Project from submit in FileUpload...');
        this.projectService.updateProject(projectUpdate);
      }
      this.dialogRef.close();

    });


  }

  cancel() {
    this.dialogRef.close();
  }

  setDestination(destination: "project" | "queue") {
    this.destination = destination;
  }
}
