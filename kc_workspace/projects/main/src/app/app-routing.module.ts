import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WebsiteExtractionComponent} from "./ingest/website-extraction/website-extraction.component";
import {SearchComponent} from "./search/search.component";
import {SettingsComponent} from "./settings/settings.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {CanvasDetailsOverviewComponent} from "./canvas/canvas-details/canvas-details-overview/canvas-details-overview.component";
import {KnowledgeSourceViewComponent} from "./canvas/canvas-details/knowledge-source-view/knowledge-source-view.component";
import {FilesComponent} from "./files/files.component";

const routes: Routes = [
  // Lazy loading should occur here
  {path: 'app-dashboard', component: DashboardComponent, children: [
      {path: '', component: CanvasDetailsOverviewComponent, outlet: 'project-detail-router'},
      {path: 'app-canvas-details-overview', component: CanvasDetailsOverviewComponent, outlet: 'project-detail-router'},
      {path: 'app-knowledge-source-view', component: KnowledgeSourceViewComponent, outlet: 'project-detail-router'}
    ]},
  {path: '', redirectTo: '/app-dashboard', pathMatch: 'full'},
  {path: 'app-files', component: FilesComponent},
  {path: 'app-search', component: SearchComponent},
  {path: 'app-website-extraction', component: WebsiteExtractionComponent},
  {path: 'app-settings', component: SettingsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
