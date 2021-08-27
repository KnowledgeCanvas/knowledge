import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WebsiteExtractionComponent} from "./ingest/website-extraction/website-extraction.component";
import {SearchComponent} from "./search/search.component";
import {SettingsComponent} from "./settings/settings.component";
import {ProjectDetailsOverviewComponent} from "./projects/projects-details-overview/project-details-overview.component";
import {KnowledgeSourceEditListComponent} from "./knowledge-source/ks-edit-list/knowledge-source-edit-list.component";
import {FilesComponent} from "./files/files.component";
import {ProjectsComponent} from "./projects/projects.component";

const routes: Routes = [
  // Lazy loading should occur here
  {path: '', redirectTo: '/app-projects', pathMatch: 'full'},
  {
    path: 'app-projects', component: ProjectsComponent, children: [
      {path: '', component: ProjectDetailsOverviewComponent, outlet: 'project-detail-router'},
      {path: 'app-projects-details-overview', component: ProjectDetailsOverviewComponent, outlet: 'project-detail-router'},
      {path: 'app-ks-edit-list', component: KnowledgeSourceEditListComponent, outlet: 'project-detail-router'}]
  },
  {path: 'app-files', component: FilesComponent},
  {path: 'app-search', component: SearchComponent},
  {path: 'app-website-extraction', component: WebsiteExtractionComponent},
  {path: 'app-settings', component: SettingsComponent},
  {path: '**', redirectTo: '/app-projects'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
