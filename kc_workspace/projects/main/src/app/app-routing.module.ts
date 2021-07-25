import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FileUploadComponent} from "./ingest/file-upload/file-upload.component";
import {WebsiteExtractionComponent} from "./ingest/website-extraction/website-extraction.component";
import {SearchComponent} from "./search/search.component";
import {SettingsComponent} from "./settings/settings.component";
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes: Routes = [
  // Lazy loading should occur here
  {path: '', component: DashboardComponent},
  {path: 'app-file-upload', component: FileUploadComponent},
  {path: 'app-search', component: SearchComponent},
  {path: 'app-website-extraction', component: WebsiteExtractionComponent},
  {path: 'app-settings', component: SettingsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
