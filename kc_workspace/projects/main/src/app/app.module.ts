import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {CanvasComponent} from './canvas/canvas.component';
import {ConfirmDialogComponent} from "../../../shared/src/components/confirm-dialog/confirm-dialog.component";
import {ConfirmDialogService} from "../../../shared/src/services/confirm-dialog/confirm-dialog.service";
import {DashboardComponent} from './dashboard/dashboard.component';
import {DragAndDropDirective} from './ingest/file-upload/directives/drag-and-drop.directive';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {FileUploadAdvancedComponent} from './ingest/file-upload/file-upload-advanced/file-upload-advanced.component';
import {FileUploadComponent} from './ingest/file-upload/file-upload.component';
import {FileUploadDragAndDropComponent} from './ingest/file-upload/file-upload-drag-and-drop/file-upload-drag-and-drop.component';
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
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTabsModule} from "@angular/material/tabs";
import {ProjectsTabsComponent} from "./projects/projects-tabs/projects-tabs.component";
import {ProjectsTreeViewComponent} from "./projects/projects-tree-view/projects-tree-view.component";
import {ProjectsTreeComponent} from "./projects/projects-tree/projects-tree.component";
import { SearchResultsDialogComponent } from './search/search-results/search-results-dialog/search-results-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {SearchService} from "../../../shared/src/services/search/search.service";
import {HttpClientModule} from "@angular/common/http";
import {MatTreeModule} from "@angular/material/tree";
import {MatMenuModule} from "@angular/material/menu";
import {MatSnackBar} from "@angular/material/snack-bar";
import { FloatingActionButtonComponent } from './floating-action-button/floating-action-button.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { CanvasDetailsComponent } from './canvas/canvas-details/canvas-details.component';
import { CanvasSourceListComponent } from './canvas/canvas-source-list/canvas-source-list.component';
import { CanvasDetailsOverviewComponent } from './canvas/canvas-details/canvas-details-overview/canvas-details-overview.component';
import { KnowledgeSourceViewComponent } from './canvas/canvas-details/knowledge-source-view/knowledge-source-view.component';
import { ProjectSummaryComponent } from './projects/project-summary/project-summary.component';
import { CanvasImportComponent } from './canvas/canvas-import/canvas-import.component';
import { FilesComponent } from './files/files.component';
import { FileListComponent } from './files/file-list/file-list.component';

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
    DashboardComponent,
    SearchBarComponent,
    SearchResultsComponent,
    CanvasComponent,
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
    FloatingActionButtonComponent,
    CanvasDetailsComponent,
    CanvasSourceListComponent,
    CanvasDetailsOverviewComponent,
    KnowledgeSourceViewComponent,
    ProjectSummaryComponent,
    CanvasImportComponent,
    FilesComponent,
    FileListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    ScrollingModule,
    DragDropModule,
    OverlayModule,
    ClipboardModule,
    MatChipsModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule,
    FormsModule,
    HttpClientModule,
    MatTreeModule,
    MatMenuModule,
    MatTooltipModule
  ],
  providers: [SettingsService, ProjectService, ConfirmDialogService, SearchService, MatSnackBar],
  bootstrap: [AppComponent]
})
export class AppModule {
}

declare global {
  interface Window {
    api?: any;
  }
}
