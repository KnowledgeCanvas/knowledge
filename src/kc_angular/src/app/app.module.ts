/**
 Copyright 2022 Rob Royce

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
import {A11yModule} from "@angular/cdk/a11y";
import {AppComponent} from './app.component';
import {AutoCompleteModule} from "primeng/autocomplete";
import {BadgeModule} from "primeng/badge";
import {BlockUIModule} from "primeng/blockui";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {ButtonModule} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {CardModule} from "primeng/card";
import {ChipModule} from "primeng/chip";
import {ChipsModule} from "primeng/chips";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {ConfirmationService, MessageService, TreeDragDropService} from "primeng/api";
import {ContextMenuModule} from "primeng/contextmenu";
import {DataViewModule} from "primeng/dataview";
import {DialogModule} from "primeng/dialog";
import {DialogService} from "primeng/dynamicdialog";
import {DisplaySettingsComponent} from './components/settings/display-settings.component';
import {DividerModule} from "primeng/divider";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {DropdownModule} from "primeng/dropdown";
import {FileUploadModule} from "primeng/fileupload";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SettingsComponent} from './components/settings/settings.component';
import {HttpClientModule} from "@angular/common/http";
import {ImageModule} from "primeng/image";
import {IngestSettingsComponent} from './components/settings/ingest-settings.component';
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {KsTableComponent} from './components/source-components/ks-table.component';
import {KsInfoComponent} from './components/source-components/ks-info.component';
import {KsIngestTypeIconPipe} from './pipes/ks-ingest-type-icon.pipe';
import {KsPreviewComponent} from './components/source-components/ks-preview.component';
import {IngestService} from "./services/ingest-services/ingest.service";
import {MenuModule} from "primeng/menu";
import {MenubarModule} from "primeng/menubar";
import {MultiSelectModule} from "primeng/multiselect";
import {NgModule} from '@angular/core';
import {OrganizationChartModule} from "primeng/organizationchart";
import {OverlayModule} from "@angular/cdk/overlay";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {PanelModule} from "primeng/panel";
import {PickListModule} from "primeng/picklist";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ProjectCreationDialogComponent} from "./components/project-components/project-creation-dialog.component";
import {ProjectInfoComponent} from './components/project-components/project-info.component';
import {ProjectNamePipe} from './pipes/project-name.pipe';
import {ProjectService} from "./services/factory-services/project.service";
import {ProjectTypePipe} from './pipes/project-type.pipe';
import {ProjectsTreeComponent} from "./components/project-components/projects-tree.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SearchSettingsComponent} from './components/settings/search-settings.component';
import {SelectButtonModule} from "primeng/selectbutton";
import {SettingsService} from "./services/ipc-services/settings.service";
import {SidebarModule} from "primeng/sidebar";
import {SkeletonModule} from "primeng/skeleton";
import {SpeedDialModule} from "primeng/speeddial";
import {SplitButtonModule} from "primeng/splitbutton";
import {SplitterModule} from "primeng/splitter";
import {StorageSettingsComponent} from './components/settings/storage-settings.component';
import {StyleClassModule} from "primeng/styleclass";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {TimelineModule} from "primeng/timeline";
import {ToastModule} from "primeng/toast";
import {ToggleButtonModule} from "primeng/togglebutton";
import {TooltipModule} from "primeng/tooltip";
import {TreeModule} from "primeng/tree";
import {TreeSelectModule} from "primeng/treeselect";
import {YouTubePlayerModule} from "@angular/youtube-player";
import {ViewportHeaderComponent} from "./components/source-components/ks-viewport/viewport-header.component";
import {FileViewComponent} from "./components/source-components/ks-viewport/file-view.component";
import {BrowserViewComponent} from "./components/source-components/ks-viewport/browser-view.component";
import {CountdownPipe} from "./pipes/countdown.pipe";
import {TruncatePipe} from "./pipes/truncate.pipe";
import {KsCardComponent} from './components/source-components/ks-card.component';
import {KsIconComponent} from './components/source-components/ks-icon.component';
import {KsIngestComponent} from './components/source-components/ks-ingest.component';
import {SliderModule} from "primeng/slider";
import {KsDropzoneComponent} from './components/source-components/ks-dropzone.component';
import {InputSwitchModule} from "primeng/inputswitch";
import {DockModule} from "primeng/dock";
import {ProjectCardComponent} from './components/project-components/project-card.component';
import {TopicListPipe} from './pipes/topic-list.pipe';
import {AccordionModule} from "primeng/accordion";
import {FullCalendarModule} from "@fullcalendar/angular";
import {TagModule} from "primeng/tag";
import {ProjectCalendarComponent} from './components/project-components/project-calendar.component';
import {KsCardListComponent} from './components/source-components/ks-card-list.component';
import {PaginatorModule} from "primeng/paginator";
import {CheckboxModule} from "primeng/checkbox";
import {ProjectBreadcrumbPipe} from './pipes/project-breadcrumb.pipe';
import {ScrollPanelModule} from "primeng/scrollpanel";
import {KsExportComponent} from "./components/source-components/ks-export.component";
import {RadioButtonModule} from "primeng/radiobutton";
import {KsThumbnailComponent} from './components/source-components/ks-thumbnail.component';
import {AppRoutingModule} from "./app-routing.module";
import {HomeComponent} from './components/home.component';
import {ProjectsComponent} from './components/projects.component';
import {TableComponent} from './components/table.component';
import {GridComponent} from './components/grid.component';
import {CalendarComponent} from './components/calendar.component';
import {ProjectBreadcrumbComponent} from "./components/project-components/project-breadcrumb.component";
import {SearchComponent} from "./components/search.component";
import {HistoryComponent} from "./components/history.component";
import {KsDetailsComponent} from './components/source-components/ks-details.component';
import {KsActionsComponent} from './components/source-components/ks-actions.component';
import {ChartModule} from "primeng/chart";
import {TimelineComponent} from './components/shared/timeline.component';
import {KsMoveComponent} from './components/source-components/ks-move.component';
import {ProjectAsTreeNodePipe} from './pipes/project-as-tree-node.pipe';
import {TopicSearchComponent} from './components/shared/topic-search.component';
import {SearchThresholdPipe} from './pipes/search-threshold.pipe';
import {TutorialComponent} from './components/shared/tutorial.component';
import {ViewIconPipe} from './pipes/view-icon.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FileViewComponent,
    ViewportHeaderComponent,
    BrowserViewComponent,
    DisplaySettingsComponent,
    KsTableComponent,
    KsInfoComponent,
    ProjectCreationDialogComponent,
    ProjectsTreeComponent,
    SearchSettingsComponent,
    StorageSettingsComponent,
    IngestSettingsComponent,
    SettingsComponent,
    KsPreviewComponent,
    ProjectInfoComponent,
    ProjectNamePipe,
    ProjectTypePipe,
    KsIngestTypeIconPipe,
    CountdownPipe,
    TruncatePipe,
    KsCardComponent,
    KsIconComponent,
    KsIngestComponent,
    KsDropzoneComponent,
    ProjectCardComponent,
    TopicListPipe,
    ProjectCalendarComponent,
    KsCardListComponent,
    ProjectBreadcrumbPipe,
    KsExportComponent,
    KsThumbnailComponent,
    HomeComponent,
    ProjectsComponent,
    TableComponent,
    GridComponent,
    CalendarComponent,
    SearchComponent,
    HistoryComponent,
    ProjectBreadcrumbComponent,
    KsDetailsComponent,
    KsActionsComponent,
    TimelineComponent,
    KsMoveComponent,
    ProjectAsTreeNodePipe,
    TopicSearchComponent,
    SearchThresholdPipe,
    TutorialComponent,
    ViewIconPipe
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    OverlayModule,
    ReactiveFormsModule,
    ScrollingModule,
    A11yModule,
    TimelineModule,
    InputTextModule,
    StyleClassModule,
    CardModule,
    ButtonModule,
    BreadcrumbModule,
    MenubarModule,
    AutoCompleteModule,
    TreeModule,
    ContextMenuModule,
    ToastModule,
    SplitterModule,
    SidebarModule,
    ImageModule,
    DividerModule,
    SpeedDialModule,
    ConfirmPopupModule,
    TableModule,
    PanelModule,
    MultiSelectModule,
    SplitButtonModule,
    TooltipModule,
    DialogModule,
    FileUploadModule,
    BadgeModule,
    OverlayPanelModule,
    MenuModule,
    TabViewModule,
    PickListModule,
    TreeSelectModule,
    SelectButtonModule,
    ToggleButtonModule,
    CalendarModule,
    YouTubePlayerModule,
    BlockUIModule,
    ChipsModule,
    OrganizationChartModule,
    ChipModule,
    ConfirmDialogModule,
    InputTextareaModule,
    DropdownModule,
    SkeletonModule,
    DataViewModule,
    ProgressSpinnerModule,
    SliderModule,
    InputSwitchModule,
    DockModule,
    AccordionModule,
    FullCalendarModule,
    ScrollPanelModule,
    TagModule,
    PaginatorModule,
    CheckboxModule,
    RadioButtonModule,
    AppRoutingModule,
    ChartModule
  ],
  providers: [
    SettingsService,
    ProjectService,
    IngestService,
    TreeDragDropService,
    MessageService,
    ConfirmationService,
    DialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

declare global {
  interface Window {
    api?: any;
    electron?: any;
  }
}
