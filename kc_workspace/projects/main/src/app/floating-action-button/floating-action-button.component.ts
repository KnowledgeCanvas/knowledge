import {Component, OnInit} from '@angular/core';
import {FloatingActionButtonAnimations} from "./floating-action-button.animations";
import {WebsiteExtractionComponent} from "../ingest/website-extraction/website-extraction.component";
import {FileUploadComponent} from "../ingest/file-upload/file-upload.component";
import {MatDialog} from "@angular/material/dialog";
import {SearchBarComponent} from "../search/search-bar/search-bar.component";

type MiniFabButton = {
  icon: string,
  label: string,
  component: any,
  dialogConfig?: {}
}

@Component({
  selector: 'app-floating-action-button',
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss'],
  animations: FloatingActionButtonAnimations
})
export class FloatingActionButtonComponent implements OnInit {

  fabButtons: MiniFabButton[] = [
    {
      icon: 'pageview',
      label: 'Search the web',
      component: SearchBarComponent,
      dialogConfig: {
        width: '65%',
        color: '#005587'
      }
    },
    {
      icon: 'description',
      label: 'Import File',
      component: FileUploadComponent
    },
    {
      icon: 'article',
      label: 'Extract Webpage',
      component: WebsiteExtractionComponent,
      dialogConfig: {
        width: '65%'
      }
    }
  ];
  buttons: MiniFabButton[] = [];
  fabTogglerState = 'inactive';

  constructor(public dialog: MatDialog) {

  }

  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  toggleFab(): void {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  ngOnInit(): void {
  }

  openDialog(component: any, config: {}) {
    const dialogRef = this.dialog.open(component, config);
    dialogRef.afterClosed().subscribe(result => {
    })
  }

  action(btn: MiniFabButton): void {
    this.openDialog(btn.component, btn.dialogConfig ? btn.dialogConfig : {});
    this.hideItems();
  }
}
