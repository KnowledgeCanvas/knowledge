import {NgModule} from '@angular/core';
import {KsLibComponent} from './ks-lib.component';
import { PageHeaderLargeComponent } from './components/page-header-large/page-header-large.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { DragAndDropDirective } from './directives/drag-and-drop/drag-and-drop.directive';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import { IngestImportSelectorComponent } from './components/ingest-import-selector/ingest-import-selector.component';
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule} from "@angular/forms";

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
    DragAndDropDirective,
    IngestImportSelectorComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatRadioModule,
    FormsModule
  ],
  exports: [
    PageHeaderLargeComponent,
    FileUploadDialogComponent,
    DragAndDropDirective,
    IngestImportSelectorComponent
  ],
  providers: []
})
export class KsLibModule {
}
