import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-file-upload-advanced',
  templateUrl: './file-upload-advanced.component.html',
  styleUrls: ['./file-upload-advanced.component.scss']
})
export class FileUploadAdvancedComponent implements OnInit {
  options: FormGroup;
  rename = new FormControl(false);
  summarize = new FormControl(true);
  visualizations = new FormControl(true);
  extractMetadata = new FormControl(true);
  rename_to = new FormControl();

  constructor(fb: FormBuilder) {
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
