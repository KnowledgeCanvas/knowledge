import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-canvas-import',
  templateUrl: './canvas-import.component.html',
  styleUrls: ['./canvas-import.component.scss']
})
export class CanvasImportComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: ProjectModel) {
    console.log('Dialog with project: ', data);
  }

  ngOnInit(): void {
  }

}
