import {Component, OnInit} from '@angular/core';
import {FileService} from "../../../../../shared/src/services/file/file.service";
import {FileModel} from "../../../../../shared/src/models/file.model";
import {StorageService} from "../../../../../shared/src/services/storage/storage.service";
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {UuidModel} from "../../../../../shared/src/models/uuid.model";

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  ksList: KnowledgeSourceModel[] = [];
  files: FileModel[] = [];

  constructor(private fileService: FileService, private storageService: StorageService) {
    fileService.list().then((ksList) => {
      this.ksList = ksList;
      for (let ks of ksList) {
        console.log('file-list -- Pushing KS: ', ks);
        if (ks.fileItem) {
          let newFileItem: FileModel = new FileModel(ks.title, ks.fileItem.size, ks.fileItem.path, ks.id);
          this.files.push(newFileItem);
        }
      }
    })
  }

  ngOnInit(): void {
  }

  openFile(id: UuidModel) {
    console.log('Opening file with ID: ', id);
  }

  removeFile(id: UuidModel) {
    console.log('Removing file with ID: ', id);
  }
}
