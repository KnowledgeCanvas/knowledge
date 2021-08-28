import {Component, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../../shared/src/models/knowledge.source.model";
import {FileModel} from "../../../../shared/src/models/file.model";
import {FileService} from "../../../../shared/src/services/file/file.service";
import {StorageService} from "../../../../shared/src/services/storage/storage.service";
import {ProjectService} from "../../../../shared/src/services/projects/project.service";
import {UuidModel} from "../../../../shared/src/models/uuid.model";

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  ksList: KnowledgeSource[] = [];
  files: FileModel[] = [];

  constructor(private fileService: FileService, private storageService: StorageService, private projectService: ProjectService) {
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
