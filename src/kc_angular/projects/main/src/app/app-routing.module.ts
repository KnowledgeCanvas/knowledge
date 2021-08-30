import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {ProjectDetailsOverviewComponent} from "./projects/project-details-overview/project-details-overview.component";
import {KnowledgeSourceEditListComponent} from "./knowledge-source/ks-edit-list/knowledge-source-edit-list.component";
import {FilesComponent} from "./ingest/files/file-list/files.component";
import {ProjectsComponent} from "./projects/projects.component";
import {StorageSettingsComponent} from "./settings/storage-settings/storage-settings.component";
import {DisplaySettingsComponent} from "./settings/display-settings/display-settings.component";
import {SearchSettingsComponent} from "./settings/search-settings/search-settings.component";
import {KnowledgeGraphComponent} from "./knowledge-graph/knowledge-graph.component";

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
      {path: 'app-ks-edit-list', component: KnowledgeSourceEditListComponent, outlet: OUTLET_PROJECT_DETAILS}]
  },
  {path: 'app-files', component: FilesComponent},
  {
    path: 'app-settings', component: SettingsComponent, children: [
      {path: '', component: SearchSettingsComponent, outlet: OUTLET_SETTINGS},
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
