import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {KnowledgeCanvasComponent} from './knowledge-source/ks-canvas/knowledge-canvas.component';
import {ConfirmDialogComponent} from "../../../shared/src/components/confirm-dialog/confirm-dialog.component";
import {ConfirmDialogService} from "../../../shared/src/services/confirm-dialog/confirm-dialog.service";
import {DragAndDropDirective} from './ingest/file-upload/directives/drag-and-drop.directive';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {FileUploadAdvancedComponent} from './ingest/file-upload/file-upload-advanced/file-upload-advanced.component';
import {FileUploadComponent} from './ingest/file-upload/file-upload.component';
import {FileUploadDragAndDropComponent} from './ingest/file-upload/file-upload-drag-and-drop/file-upload-drag-and-drop.component';
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatOptionModule} from "@angular/material/core";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {OverlayModule} from "@angular/cdk/overlay";
import {ProjectContextComponent} from "./projects/project-context/project-context.component";
import {ProjectCreationDialogComponent} from "./projects/project-creation-dialog/project-creation-dialog.component";
import {ProjectDetailComponent} from "./projects/project-detail/project-detail.component";
import {ProjectService} from "../../../shared/src/services/projects/project.service";
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectsNavigationComponent} from "./projects/projects-navigation/projects-navigation.component";
import {ProjectsSidebarComponent} from "./projects/projects-sidebar/projects-sidebar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SearchBarComponent} from './search/search-bar/search-bar.component';
import {SearchComponent} from './search/search.component';
import {SearchResultsComponent} from './search/search-results/search-results.component';
import {SettingsComponent} from './settings/settings.component';
import {SettingsService} from "../../../shared/src/services/settings/settings.service";
import {WebsiteExtractionComponent} from './ingest/website-extraction/website-extraction.component';
import {WebsiteExtractionFormComponent} from './ingest/website-extraction/website-extraction-form/website-extraction-form.component';
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatChipsModule} from "@angular/material/chips";
import {MatTabsModule} from "@angular/material/tabs";
import {ProjectsTabsComponent} from "./projects/projects-tabs/projects-tabs.component";
import {ProjectsTreeViewComponent} from "./projects/projects-tree-view/projects-tree-view.component";
import {ProjectsTreeComponent} from "./projects/projects-tree/projects-tree.component";
import {SearchResultsDialogComponent} from './search/search-results/search-results-dialog/search-results-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {SearchService} from "../../../shared/src/services/search/search.service";
import {HttpClientModule} from "@angular/common/http";
import {MatTreeModule} from "@angular/material/tree";
import {MatMenuModule} from "@angular/material/menu";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ProjectViewportComponent} from './projects/project-viewport/project-viewport.component';
import {KnowledgeSourceDropListComponent} from './knowledge-source/ks-drop-list/knowledge-source-drop-list.component';
import {ProjectDetailsOverviewComponent} from './projects/projects-details-overview/project-details-overview.component';
import {KnowledgeSourceEditListComponent} from './knowledge-source/ks-edit-list/knowledge-source-edit-list.component';
import {ProjectSummaryComponent} from './projects/project-summary/project-summary.component';
import {KnowledgeSourceImportDialogComponent} from './knowledge-source/ks-import-dialog/knowledge-source-import-dialog.component';
import {FilesComponent} from './files/files.component';
import {FileListComponent} from './files/file-list/file-list.component';
import {ProjectTopicListComponent} from "./projects/project-topic-list/project-topic-list.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {SearchApiComponent} from './search/search-api/search-api.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {WebsiteExtractionAdvancedComponent} from './ingest/website-extraction/website-extraction-advanced/website-extraction-advanced.component';
import {KsInfoDialogComponent} from './knowledge-source/ks-info-dialog/ks-info-dialog.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {KsInfoComponent} from './knowledge-source/ks-info/ks-info.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    WebsiteExtractionComponent,
    FileUploadDragAndDropComponent,
    FileUploadAdvancedComponent,
    WebsiteExtractionFormComponent,
    SearchComponent,
    DragAndDropDirective,
    SettingsComponent,
    SearchBarComponent,
    SearchResultsComponent,
    KnowledgeCanvasComponent,
    ProjectsComponent,
    ProjectsSidebarComponent,
    ProjectContextComponent,
    ProjectCreationDialogComponent,
    ProjectDetailComponent,
    ProjectsNavigationComponent,
    ConfirmDialogComponent,
    ProjectsTabsComponent,
    ProjectsTreeViewComponent,
    ProjectsTreeComponent,
    SearchResultsDialogComponent,
    ProjectViewportComponent,
    KnowledgeSourceDropListComponent,
    ProjectDetailsOverviewComponent,
    KnowledgeSourceEditListComponent,
    ProjectSummaryComponent,
    KnowledgeSourceImportDialogComponent,
    FilesComponent,
    FileListComponent,
    ProjectTopicListComponent,
    SearchApiComponent,
    WebsiteExtractionAdvancedComponent,
    KsInfoDialogComponent,
    KsInfoComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
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
    MatGridListModule,
    MatCardModule
  ],
  providers: [SettingsService, ProjectService, ConfirmDialogService, SearchService, MatSnackBar, MatAccordion],
  bootstrap: [AppComponent]
})
export class AppModule {
}

declare global {
  interface Window {
    api?: any;
  }
}
