import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FileService} from "../../../../../shared/src/services/file/file.service";


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  options: FormGroup;
  rename = new FormControl(false);
  summarize = new FormControl(true);
  visualizations = new FormControl(true);
  extractMetadata = new FormControl(true);
  rename_to = new FormControl();


  constructor(fb: FormBuilder, private fileService: FileService) {
    this.options = fb.group({
      rename: this.rename,
      rename_to: this.rename_to,
      summarize: this.summarize,
      visualizations: this.visualizations,
      extractMetadata: this.extractMetadata
    });
  }

  ngOnInit(): void {
  }

}
