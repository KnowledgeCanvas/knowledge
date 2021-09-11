import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {ProjectDetailsOverviewComponent} from "./projects/project-details-overview/project-details-overview.component";
import {KnowledgeSourceTableComponent} from "./knowledge-source/ks-table/knowledge-source-table.component";
import {FilesComponent} from "./ingest/files/file-list/files.component";
import {ProjectsComponent} from "./projects/projects.component";
import {StorageSettingsComponent} from "./settings/storage-settings/storage-settings.component";
import {DisplaySettingsComponent} from "./settings/display-settings/display-settings.component";
import {SearchSettingsComponent} from "./settings/search-settings/search-settings.component";
import {KnowledgeGraphComponent} from "./knowledge-graph/knowledge-graph.component";
import {GeneralSettingsComponent} from "./settings/general-settings/general-settings.component";
import {IngestSettingsComponent} from "./settings/ingest-settings/ingest-settings.component";

export const OUTLET_PROJECT_DETAILS = 'project-detail-router';
export const OUTLET_SETTINGS = 'settings-router';

const routes: Routes = [
  // Lazy loading should occur here
  {path: '', redirectTo: '/app-projects', pathMatch: 'full'},
  {
    path: 'app-projects', component: ProjectsComponent, children: [
      {path: '', component: ProjectDetailsOverviewComponent, outlet: OUTLET_PROJECT_DETAILS},
      {
        path: 'app-projects-details-overview',
        component: ProjectDetailsOverviewComponent,
        outlet: OUTLET_PROJECT_DETAILS
      },
      {path: 'app-knowledge-graph', component: KnowledgeGraphComponent, outlet: OUTLET_PROJECT_DETAILS},
      {path: 'app-ks-table', component: KnowledgeSourceTableComponent, outlet: OUTLET_PROJECT_DETAILS}]
  },
  {path: 'app-files', component: FilesComponent},
  {
    path: 'app-settings', component: SettingsComponent, children: [
      {path: '', component: GeneralSettingsComponent, outlet: OUTLET_SETTINGS},
      {path: 'app-general-settings', component: GeneralSettingsComponent, outlet: OUTLET_SETTINGS},
      {path: 'app-ingest-settings', component: IngestSettingsComponent, outlet: OUTLET_SETTINGS},
      {path: 'app-display-settings', component: DisplaySettingsComponent, outlet: OUTLET_SETTINGS},
      {path: 'app-storage-settings', component: StorageSettingsComponent, outlet: OUTLET_SETTINGS},
      {path: 'app-search-settings', component: SearchSettingsComponent, outlet: OUTLET_SETTINGS},
    ]
  },
  {path: '**', redirectTo: '/app-projects'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
