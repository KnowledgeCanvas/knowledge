import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {SearchService} from "../../../../../shared/src/services/search/search.service";

@Component({
  selector: 'app-canvas-import',
  templateUrl: './canvas-import.component.html',
  styleUrls: ['./canvas-import.component.scss']
})
export class CanvasImportComponent implements OnInit {
  searchTerm: string = '';

  constructor(private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: ProjectModel,
              private searchService: SearchService) {
  }

  ngOnInit(): void {
  }

  search() {
    this.searchService.search(this.searchTerm).then(() => {
      this.dialogRef.close();
    });
  }
}
