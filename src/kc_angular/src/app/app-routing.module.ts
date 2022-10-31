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
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {DisplaySettingsComponent} from "./components/settings/display-settings.component";
import {SearchSettingsComponent} from "./components/settings/search-settings.component";
import {IngestSettingsComponent} from "./components/settings/ingest-settings.component";
import {HomeComponent} from "./components/home.component";
import {ProjectsComponent} from "./components/projects.component";
import {TableComponent} from "./components/table.component";
import {GridComponent} from "./components/grid.component";
import {CalendarComponent} from "./components/calendar.component";
import {StorageSettingsComponent} from "./components/settings/storage-settings.component";
import {GraphComponent} from "./components/graph.component";

const routes: Routes = [
  {path: '', redirectTo: '/app/inbox/undefined', pathMatch: 'full'},
  {
    path: 'app',
    children: [
      {
        path: 'inbox/:projectId',
        component: HomeComponent,
      },
      {
        path: 'projects/:projectId',
        component: ProjectsComponent
      },
      {
        path: 'graph/:projectId',
        component: GraphComponent
      },
      {
        path: 'table/:projectId',
        component: TableComponent
      },
      {
        path: 'grid/:projectId',
        component: GridComponent
      },
      {
        path: 'calendar/:projectId',
        component: CalendarComponent
      },
      {
        path: 'display',
        outlet: 'settings',
        component: DisplaySettingsComponent,
      },
      {
        path: 'search',
        outlet: 'settings',
        component: SearchSettingsComponent,
      },
      {
        path: 'import',
        outlet: 'settings',
        component: IngestSettingsComponent,
      },
      {
        path: 'storage',
        outlet: 'settings',
        component: StorageSettingsComponent
      }
    ]
  },
  {path: '**', redirectTo: '/app/inbox'},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
