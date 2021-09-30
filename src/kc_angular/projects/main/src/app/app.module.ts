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
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ConfirmDialogComponent} from "../../../ks-lib/src/lib/components/dialogs/confirm-dialog/confirm-dialog.component";
import {DisplaySettingsComponent} from './settings/display-settings/display-settings.component';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {FileUploadComponent} from './ingest/files/file-upload/file-upload.component';
import {FilesComponent} from './ingest/files/file-list/files.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {KcDialogService} from "../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {KnowledgeCanvasComponent} from './knowledge-source/ks-canvas/knowledge-canvas.component';
import {KnowledgeGraphComponent} from './knowledge-graph/knowledge-graph.component';
import {KnowledgeSourceDropListComponent} from './knowledge-source/ks-drop-list/knowledge-source-drop-list.component';
import {KnowledgeSourceTableComponent} from './knowledge-source/ks-table/knowledge-source-table.component';
import {KnowledgeSourceImportDialogComponent} from './knowledge-source/ks-import-dialog/knowledge-source-import-dialog.component';
import {KsInfoComponent} from './knowledge-source/ks-info/ks-info.component';
import {KsInfoDialogComponent} from './knowledge-source/ks-info-dialog/ks-info-dialog.component';
import {KsLibModule} from "../../../ks-lib/src/lib/ks-lib.module";
import {KsQueueComponent} from './knowledge-source/ks-queue/ks-queue.component';
import {KsQueueService} from "./knowledge-source/ks-queue-service/ks-queue.service";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatTreeModule} from "@angular/material/tree";
import {OverlayModule} from "@angular/cdk/overlay";
import {ProjectCalendarComponent} from './projects/project-calendar/project-calendar.component';
import {ProjectCreationDialogComponent} from "./projects/project-creation-dialog/project-creation-dialog.component";
import {ProjectDetailViewportComponent} from "./projects/project-detail-viewport/project-detail-viewport.component";
import {ProjectDetailsOverviewComponent} from './projects/project-details-overview/project-details-overview.component';
import {ProjectService} from "../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectTopicListComponent} from "./projects/project-topic-list/project-topic-list.component";
import {ProjectViewportComponent} from './projects/project-viewport/project-viewport.component';
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectsNavigationComponent} from "./projects/projects-navigation/projects-navigation.component";
import {ProjectsTreeComponent} from "./projects/projects-tree/projects-tree.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SearchApiComponent} from './search/search-api-input-dialog/search-api.component';
import {SearchBarComponent} from './search/search-bar/search-bar.component';
import {SearchResultsComponent} from './search/search-results/search-results.component';
import {SearchSettingsComponent} from './settings/search-settings/search-settings.component';
import {SettingsCommonHeaderComponent} from './settings/settings-common-header/settings-common-header.component';
import {SettingsComponent} from './settings/settings.component';
import {SettingsService} from "../../../ks-lib/src/lib/services/settings/settings.service";
import {StorageSettingsComponent} from './settings/storage-settings/storage-settings.component';
import {WebsiteExtractionAdvancedComponent} from './ingest/website-extraction/website-extraction-advanced/website-extraction-advanced.component';
import {WebsiteExtractionComponent} from './ingest/website-extraction/website-extraction.component';
import {NoteCreationComponent} from './ingest/note-creation/note-creation.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {IngestSettingsComponent} from './settings/ingest-settings/ingest-settings.component';
import {GeneralSettingsComponent} from './settings/general-settings/general-settings.component';
import {KsPreviewComponent} from './knowledge-source/ks-preview/ks-preview.component';
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule} from "@angular/material/paginator";
import {A11yModule} from "@angular/cdk/a11y";

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    DisplaySettingsComponent,
    FileUploadComponent,
    FilesComponent,
    KnowledgeCanvasComponent,
    KnowledgeGraphComponent,
    KnowledgeSourceDropListComponent,
    KnowledgeSourceTableComponent,
    KnowledgeSourceImportDialogComponent,
    KsInfoComponent,
    KsInfoDialogComponent,
    KsQueueComponent,
    ProjectCalendarComponent,
    ProjectCreationDialogComponent,
    ProjectDetailViewportComponent,
    ProjectDetailsOverviewComponent,
    ProjectTopicListComponent,
    ProjectViewportComponent,
    ProjectsComponent,
    ProjectsNavigationComponent,
    ProjectsTreeComponent,
    SearchApiComponent,
    SearchBarComponent,
    SearchResultsComponent,
    SearchSettingsComponent,
    SettingsCommonHeaderComponent,
    SettingsComponent,
    StorageSettingsComponent,
    WebsiteExtractionAdvancedComponent,
    WebsiteExtractionComponent,
    NoteCreationComponent,
    IngestSettingsComponent,
    GeneralSettingsComponent,
    KsPreviewComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    KsLibModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatOptionModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    A11yModule,
  ],
  providers: [SettingsService, ProjectService, KcDialogService, KsQueueService, MatSnackBar, MatAccordion, MatDatepickerModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}

declare global {
  interface Window {
    api?: any;
  }
}
