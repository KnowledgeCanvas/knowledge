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
import { Injectable } from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {BehaviorSubject} from "rxjs";
import {KcProject} from "../../models/project.model";
import {StorageService} from "../ipc-services/storage.service";
import {SettingsService} from "../ipc-services/settings.service";
import {ProjectService} from "../factory-services/project.service";
import {FaviconService} from "../ingest-services/favicon.service";
import {KsCommandService} from "../command-services/ks-command.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private __ksList = new BehaviorSubject<KnowledgeSource[]>([]);
  ksList = this.__ksList.asObservable();

  private __projectList = new BehaviorSubject<KcProject[]>([]);
  projectList = this.__projectList.asObservable();

  private __currentProject = new BehaviorSubject<KcProject | undefined>(undefined);
  currentProject = this.__currentProject.asObservable();

  private __selectedKs = new BehaviorSubject<KnowledgeSource[]>([]);
  selectKs = this.__selectedKs.asObservable();

  private projectInheritance: boolean = true;

  constructor(private storage: StorageService,
              private settings: SettingsService,
              private favicon: FaviconService,
              private projects: ProjectService) {
    settings.app.subscribe((app) => {

      try {
        this.projectInheritance = app.projects.ksInherit;
      } catch (e) {
        this.projectInheritance = true;
        this.settings.set({app: {projects: {ksInherit: true}}});
      }
    })

    projects.currentProject.subscribe((project) => {
      if (!project) {
        return;
      }
      let ksList: KnowledgeSource[] = [];
      let queue: KcProject[] = [project];

      while (queue.length > 0) {
        let p = queue.shift();
        if (p && p.knowledgeSource) {
          ksList = ksList.concat(p.knowledgeSource);
        }

        if (p && this.projectInheritance) {
          for (let sub of p.subprojects) {
            let s = this.projects.getProject(sub);
            if (s) {
              queue.push(s);
            }
          }
        }
      }

      this.favicon.extractFromKsList(ksList).then((ready) => {
        this.__ksList.next(ready);
      })
    })
  }



}
