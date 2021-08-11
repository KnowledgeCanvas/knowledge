import { Component, OnInit } from '@angular/core';
import {FileService} from "../../../../../shared/src/services/file/file.service";
import {FileModel} from "../../../../../shared/src/models/file.model";

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  files: FileModel[] = [];

  constructor(private fileService: FileService) {
    fileService.list().then((files) => {
      this.files = files;
    })
  }

  ngOnInit(): void {
  }

}
