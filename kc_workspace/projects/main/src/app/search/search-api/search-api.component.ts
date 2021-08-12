import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-search-api',
  templateUrl: './search-api.component.html',
  styleUrls: ['./search-api.component.scss']
})
export class SearchApiComponent implements OnInit {
  key = new FormControl();
  constructor(private dialogRef: MatDialogRef<SearchApiComponent>) { }

  ngOnInit(): void {
  }

  submit() {
    console.log('Got API Key: ', this.key.value);
    this.dialogRef.close(this.key.value);
  }
}
