import {NgModule} from '@angular/core';
import {KsLibComponent} from './ks-lib.component';
import { PageHeaderLargeComponent } from './common/page-header-large/page-header-large.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DragAndDropDirective } from './directives/drag-and-drop/drag-and-drop.directive';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";

declare global {
  interface Window {
    api?: any;
  }
}

@NgModule({
  declarations: [
    KsLibComponent,
    PageHeaderLargeComponent,
    FileUploadDialogComponent,
    DragAndDropDirective
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  exports: [
    PageHeaderLargeComponent,
    FileUploadDialogComponent,
    DragAndDropDirective
  ],
  providers: []
})
export class KsLibModule {
}
