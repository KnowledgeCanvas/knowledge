/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

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
import {KsDragAndDropComponent} from './components/knowledge-source-drag-and-drop-list/ks-drag-and-drop.component';
import {KsDndVerticalDirective} from './directives/ksDnd/ks-dnd-vertical.directive';
import {KsDndHorizontalDirective} from './directives/ksDnd/ks-dnd-horizontal.directive';
import {DragDropModule} from "@angular/cdk/drag-drop";
import { HoverClassDirective } from './directives/hover/hover-class.directive';
import { KsIngestFabComponent } from './components/ks-ingest-fab/ks-ingest-fab.component';
import { KsContextMenuComponent } from './components/ks-context-menu/ks-context-menu.component';
import {MatMenuModule} from "@angular/material/menu";

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
    KsDragAndDropComponent,
    KsDndVerticalDirective,
    KsDndHorizontalDirective,
    HoverClassDirective,
    KsIngestFabComponent,
    KsContextMenuComponent
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
    DragDropModule,
    MatMenuModule
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
    KsDragAndDropComponent,
    KsIngestFabComponent,
    KsContextMenuComponent
  ],
  providers: []
})
export class KsLibModule {
}
