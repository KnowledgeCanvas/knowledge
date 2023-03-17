/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {Injectable, NgZone} from '@angular/core';
import {ElectronIpcService} from "../ipc-services/electron-ipc.service";
import {BehaviorSubject, from, skip, switchMap, tap} from "rxjs";
import {KcProject} from "../../models/project.model";
import {NotificationsService} from "../user-services/notifications.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectStorageService {
  private STORAGE_KEY: string = 'projects';
  subpath = [this.STORAGE_KEY];

  private _projectList = new BehaviorSubject<string[]>([]);
  projectList = this._projectList.asObservable();

  private _projects = new BehaviorSubject<KcProject[]>([]);
  projects = this._projects.asObservable();

  private send = window.api.send;
  private receive = window.api.receive;
  private receiveOnce = window.api.receiveOnce;
  private removeAllListeners = window.api.removeAllListeners;

  constructor(private ipc: ElectronIpcService, private zone: NgZone, private notifications: NotificationsService) {
    this.projectList.pipe(
      skip(1), // Skip the empty array from the initializer
      switchMap((ids) => from(this.getProjects(ids))),
      tap((projects: KcProject[]) => {
        this._projects.next(projects);
      })
    ).subscribe()

    this._getProjectList();


  }

  private async _getProjectList() {
    let msg = await this.ipc.storage.get(this.STORAGE_KEY, this.subpath);
    this.zone.run(() => {
      if (msg.success?.data && msg.success.data.length > 0) {
        this.notifications.debug('Project Storage Service', 'Project List Changed', 'Retrieved project list from file.');
        this._projectList.next(msg.success.data);
      } else {
        console.log('Failed to get project list from file...', msg);
      }
    })
  }

  async getProjects(ids: string[]): Promise<KcProject[]> {
    console.log('Getting projects from project id list: ', ids);
    let projects: KcProject[] = [];
    let msg = await this.ipc.storage.getMany(ids, this.subpath);
    if (msg.success?.data) {
      let projectMap: object = msg.success.data;
      let projectValues: any = Object.values(projectMap);
      if (projectValues && projectValues.length > 0 && projectValues[0].id) {
        projects = projectValues;

        console.log('Got project values: ', projects); // TODO
      }
    }
    return projects;
  }

  async updateProject(target: KcProject) {
    let msg = await this.ipc.storage.set(target.id.value, target, this.subpath)
    console.log('Updated project: ', target);
    console.log('Got response: ', msg);
  }

  async deleteProject(targets: KcProject[]) {
    let msg = await this.ipc.storage.delete(targets.map(p => p.id.value), this.subpath);
    console.log('Deleted project(s): ', msg);
  }

  async createProject(targets: KcProject[]) {
    let projectList = this._projectList.value;
    for (let target of targets) {
      await this.updateProject(target);
      projectList.push(target.id.value);
    }
    let msg = await this.ipc.storage.set(this.STORAGE_KEY, this.subpath);
    console.log('Saved project list with response: ', msg);

  }
}
