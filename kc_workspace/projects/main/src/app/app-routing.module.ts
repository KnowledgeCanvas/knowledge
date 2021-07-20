import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FileUploadComponent} from "./ingest/file-upload/file-upload.component";
import {WebsiteExtractionComponent} from "./ingest/website-extraction/website-extraction.component";

const routes: Routes = [
  // Lazy loading should occur here
  {path: 'app-file-upload', component: FileUploadComponent},
  {path: 'app-website-extraction', component: WebsiteExtractionComponent},
  // {path: 'app-agents', component: AgentComponent},
  // {path: 'app-transformer', component: TransformerComponent},
  // {path: 'app-settings', component: SettingsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
