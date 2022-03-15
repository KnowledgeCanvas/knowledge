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

import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ProjectModel, ProjectUpdateRequest} from "../../../models/project.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectCommandService {

  private _projectDetailEvent = new BehaviorSubject<ProjectModel | undefined>(undefined);
  projectDetailEvent = this._projectDetailEvent.asObservable();

  private _projectRemoveEvent = new BehaviorSubject<ProjectModel[]>([]);
  projectRemoveEvent = this._projectRemoveEvent.asObservable();

  private _projectShareEvent = new BehaviorSubject<ProjectModel[]>([]);
  projectShareEvent = this._projectShareEvent.asObservable();

  private _projectCopyJSONEvent = new BehaviorSubject<ProjectModel[]>([]);
  projectCopyJSONEvent = this._projectCopyJSONEvent.asObservable();

  private _projectUpdateEvent = new BehaviorSubject<ProjectUpdateRequest[]>([]);
  projectUpdateEvent = this._projectUpdateEvent.asObservable();

  constructor() {
  }

  update(projectList: ProjectUpdateRequest[]) {
    this._projectUpdateEvent.next(projectList);
  }

  remove(projectList: ProjectModel[]) {
    this._projectRemoveEvent.next(projectList);
  }

  detail(project: ProjectModel) {
    this._projectDetailEvent.next(project);
  }

  share(projectList: ProjectModel[]) {
    this._projectShareEvent.next(projectList);
  }

  copyJSON(projectList: ProjectModel[]) {
    this._projectCopyJSONEvent.next(projectList);
  }
}
