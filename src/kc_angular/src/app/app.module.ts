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
import {DisplaySettingsComponent} from './components/settings-components/display-settings/display-settings.component';
import {DividerModule} from "primeng/divider";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {DropdownModule} from "primeng/dropdown";
import {FileUploadModule} from "primeng/fileupload";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GeneralSettingsComponent} from './components/settings-components/general-settings/general-settings.component';
import {HttpClientModule} from "@angular/common/http";
import {ImageModule} from "primeng/image";
import {IngestSettingsComponent} from './components/settings-components/ingest-settings/ingest-settings.component';
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {KnowledgeCanvasComponent} from './components/knowledge-source-components/ks-canvas/knowledge-canvas.component';
import {KnowledgeGraphComponent} from './components/knowledge-graph-components/knowledge-graph.component';
import {KnowledgeSourceTableComponent} from './components/knowledge-source-components/ks-table/knowledge-source-table.component';
import {KsImportConfirmComponent} from './components/knowledge-source-components/ks-import-confirm/ks-import-confirm.component';
import {KsInfoComponent} from './components/knowledge-source-components/ks-info/ks-info.component';
import {KsIngestTypeIconPipe} from './pipes/image-pipes/ks-ingest-type-icon/ks-ingest-type-icon.pipe';
import {KsPreviewComponent} from './components/knowledge-source-components/ks-preview/ks-preview.component';
import {KsUpNextComponent} from './components/knowledge-source-components/ks-queue/ks-up-next.component';
import {KsQueueService} from "./services/command-services/ks-queue-service/ks-queue.service";
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
import {ProjectCreationDialogComponent} from "./components/project-components/project-creation-dialog/project-creation-dialog.component";
import {ProjectDetailViewportComponent} from "./components/project-components/project-detail-viewport/project-detail-viewport.component";
import {ProjectDetailsOverviewComponent} from './components/project-components/project-details-overview/project-details-overview.component';
import {ProjectInfoComponent} from './components/project-components/project-info/project-info.component';
import {ProjectNamePipe} from './pipes/project-pipes/project-name/project-name.pipe';
import {ProjectService} from "./services/factory-services/project-service/project.service";
import {ProjectTypePipe} from './pipes/project-pipes/project-type/project-type.pipe';
import {ProjectsTreeComponent} from "./components/project-components/projects-tree/projects-tree.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SearchSettingsComponent} from './components/settings-components/search-settings/search-settings.component';
import {SelectButtonModule} from "primeng/selectbutton";
import {SettingsService} from "./services/ipc-services/settings-service/settings.service";
import {SidebarModule} from "primeng/sidebar";
import {SkeletonModule} from "primeng/skeleton";
import {SpeedDialModule} from "primeng/speeddial";
import {SplitButtonModule} from "primeng/splitbutton";
import {SplitterModule} from "primeng/splitter";
import {StorageSettingsComponent} from './components/settings-components/storage-settings/storage-settings.component';
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

import {ViewportHeaderComponent} from "./components/knowledge-source-components/ks-viewport-components/viewport-header/viewport-header.component";
import {FileViewComponent} from "./components/knowledge-source-components/ks-viewport-components/file-viewport/file-view.component";
import {BrowserViewComponent} from "./components/knowledge-source-components/ks-viewport-components/browser-viewport/browser-view.component";
import {CountdownPipe} from "./pipes/date-pipes/countdown-pipe/countdown.pipe";
import {TruncatePipe} from "./pipes/text-pipes/truncate-pipe/truncate.pipe";
import {KsCardComponent} from './components/knowledge-source-components/ks-card/ks-card.component';
import {KsIconComponent} from './components/knowledge-source-components/ks-icon/ks-icon.component';
import {KsIngestComponent} from './components/knowledge-source-components/ks-ingest/ks-ingest.component';
import {SliderModule} from "primeng/slider";
import {DropzoneComponent} from './components/knowledge-source-components/ks-ingest/dropzone/dropzone.component';
import {InputSwitchModule} from "primeng/inputswitch";
import {DockModule} from "primeng/dock";
import {KsDataviewComponent} from './components/knowledge-source-components/ks-dataview/ks-dataview.component';
import {ProjectCardComponent} from './components/project-components/project-card/project-card.component';
import {TopicListPipe} from './pipes/text-pipes/topic-list-pipe/topic-list.pipe';
import {AccordionModule} from "primeng/accordion";

@NgModule({
  declarations: [
    AppComponent,
    FileViewComponent,
    ViewportHeaderComponent,
    BrowserViewComponent,
    DisplaySettingsComponent,
    KnowledgeCanvasComponent,
    KnowledgeGraphComponent,
    KnowledgeSourceTableComponent,
    KsInfoComponent,
    KsUpNextComponent,
    ProjectCreationDialogComponent,
    ProjectDetailViewportComponent,
    ProjectDetailsOverviewComponent,
    ProjectsTreeComponent,
    SearchSettingsComponent,
    StorageSettingsComponent,
    IngestSettingsComponent,
    GeneralSettingsComponent,
    KsPreviewComponent,
    ProjectInfoComponent,
    KsImportConfirmComponent,
    ProjectNamePipe,
    ProjectTypePipe,
    KsIngestTypeIconPipe,
    CountdownPipe,
    TruncatePipe,
    KsCardComponent,
    KsIconComponent,
    KsIngestComponent,
    DropzoneComponent,
    KsDataviewComponent,
    ProjectCardComponent,
    TopicListPipe,
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
    AccordionModule
  ],
  providers: [
    SettingsService,
    ProjectService,
    KsQueueService,
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
