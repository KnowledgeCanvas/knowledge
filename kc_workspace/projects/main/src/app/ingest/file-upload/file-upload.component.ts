import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FileService} from "../../../../../shared/src/services/file/file.service";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  projectId = '';


  constructor(fb: FormBuilder, private fileService: FileService, private projectService: ProjectService) {
    this.projectService.currentProject.subscribe((project) => {
      this.projectId = project.id.value ? project.id.value : '';
    })
  }

  ngOnInit(): void {
  }

}
