import {NgModule} from '@angular/core';
import {KsLibComponent} from './ks-lib.component';
import {PageHeaderLargeComponent} from './components/page-header-large/page-header-large.component';
import {FileUploadDialogComponent} from './components/file-upload-dialog/file-upload-dialog.component';
import {DragAndDropDirective} from './directives/drag-and-drop/drag-and-drop.directive';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {IngestImportSelectorComponent} from './components/ingest-import-selector/ingest-import-selector.component';
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DigitalWellnessComponent} from './components/digital-wellness/digital-wellness.component';
import {DigitalWellnessSettingsComponent} from './components/digital-wellness-settings/digital-wellness-settings.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {BrowserViewComponent} from './components/viewports/browser-view/browser-view.component';
import {FileViewComponent} from './components/viewports/file-view/file-view.component';
import {ExplorerComponent} from './components/viewports/explorer-view/explorer.component';
import {ViewportHeaderComponent} from './components/viewports/shared/viewport-header/viewport-header.component';
import {ViewportFooterComponent} from './components/viewports/shared/viewport-footer/viewport-footer.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {TruncatePipe} from './pipes/truncate.pipe';
import {ProjectBreadcrumbPipe} from './pipes/project-breadcrumb.pipe';
import {KnowledgeSourceDragAndDropListComponent} from './components/knowledge-source-drag-and-drop-list/knowledge-source-drag-and-drop-list.component';
import {KsDndVerticalDirective} from './directives/ksDnd/ks-dnd-vertical.directive';
import {KsDndHorizontalDirective} from './directives/ksDnd/ks-dnd-horizontal.directive';
import {DragDropModule} from "@angular/cdk/drag-drop";
import { HoverClassDirective } from './directives/hover/hover-class.directive';

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
    DigitalWellnessSettingsComponent,
    ProgressBarComponent,
    BrowserViewComponent,
    FileViewComponent,
    ExplorerComponent,
    ViewportHeaderComponent,
    ViewportFooterComponent,
    TruncatePipe,
    ProjectBreadcrumbPipe,
    KnowledgeSourceDragAndDropListComponent,
    KsDndVerticalDirective,
    KsDndHorizontalDirective,
    HoverClassDirective
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
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    DragDropModule
  ],
  exports: [
    PageHeaderLargeComponent,
    FileUploadDialogComponent,
    DragAndDropDirective,
    IngestImportSelectorComponent,
    DigitalWellnessComponent,
    DigitalWellnessSettingsComponent,
    ProgressBarComponent,
    BrowserViewComponent,
    FileViewComponent,
    ExplorerComponent,
    ViewportHeaderComponent,
    ViewportFooterComponent,
    TruncatePipe,
    ProjectBreadcrumbPipe,
    KnowledgeSourceDragAndDropListComponent,
  ],
  providers: []
})
export class KsLibModule {
}
