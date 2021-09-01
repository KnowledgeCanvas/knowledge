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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DigitalWellnessComponent } from './components/digital-wellness/digital-wellness.component';
import { DigitalWellnessSettingsComponent } from './components/digital-wellness-settings/digital-wellness-settings.component';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetModule, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";

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
    IngestImportSelectorComponent,
    DigitalWellnessComponent,
    DigitalWellnessSettingsComponent
  ],
    imports: [
        MatIconModule,
        MatButtonModule,
        MatBottomSheetModule,
        CommonModule,
        MatRadioModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDividerModule
    ],
  exports: [
    PageHeaderLargeComponent,
    FileUploadDialogComponent,
    DragAndDropDirective,
    IngestImportSelectorComponent,
    DigitalWellnessComponent,
    DigitalWellnessSettingsComponent
  ],
  providers: []
})
export class KsLibModule {
}
