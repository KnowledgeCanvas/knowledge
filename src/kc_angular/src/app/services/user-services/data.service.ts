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
import {Injectable, OnDestroy} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {BehaviorSubject, Subject, tap} from "rxjs";
import {KcProject} from "../../models/project.model";
import {StorageService} from "../ipc-services/storage.service";
import {SettingsService} from "../ipc-services/settings.service";
import {ProjectService} from "../factory-services/project.service";
import {FaviconService} from "../ingest-services/favicon.service";
import {map, takeUntil} from "rxjs/operators";
import {UUID} from "../../../../../kc_shared/models/uuid.model";

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private __allKs = new BehaviorSubject<KnowledgeSource[]>([]);
  allKs = this.__allKs.asObservable();

  private __ksList = new BehaviorSubject<KnowledgeSource[]>([]);
  ksList = this.__ksList.asObservable();

  private __projectList = new BehaviorSubject<KcProject[]>([]);
  projectList = this.__projectList.asObservable();

  private __currentProject = new BehaviorSubject<KcProject | undefined>(undefined);
  currentProject = this.__currentProject.asObservable();

  private __selectedKs = new BehaviorSubject<KnowledgeSource[]>([]);
  selectKs = this.__selectedKs.asObservable();

  private projectInheritance: boolean = true;

  private cleanUp: Subject<any> = new Subject<any>();

  sources = {
    create: async (ksList: KnowledgeSource[]) => {
      return this.sources.update(ksList);
    },

    get: async (uuids: UUID[]): Promise<KnowledgeSource[]> => {
      let ksList: KnowledgeSource[] = [];
      for (let id of uuids) {
        const lookup = `ks-${id.value}`;
        const kstr = localStorage.getItem(lookup);
        if (kstr) {
          const ks = JSON.parse(kstr);
          if (ks) {
            ksList.push(ks);
          }
        }
      }
      return ksList;
    },

    update: async (ksList: KnowledgeSource[]) => {
      for (let ks of ksList) {
        const lookup = `ks-${ks.id.value}`;
        const kstr = JSON.stringify(ks);
        if (kstr) {
          localStorage.setItem(lookup, kstr);
        }
      }

      // TODO: Remove this after projects no longer carry entire KS objects...
      for (let ks of ksList) {
        await this._projects.updateProjects([{
          id: ks.associatedProject,
          updateKnowledgeSource: [ks]
        }]);
      }
    },

    delete: async (ksList: KnowledgeSource[]) => {
      for (let ks of ksList) {
        const lookup = `ks-${ks.id.value}`;
        localStorage.removeItem(lookup);
      }
    },

    count: this.__ksList.asObservable().pipe(
      map(sources => sources.length)
    ),

    typeCount: this.__ksList.asObservable().pipe(
      map((sources) => {
        let counts = {
          websites: 0,
          files: 0
        }

        sources.map(s => s.ingestType).forEach((ingestType) => {
          if (ingestType === "website") {
            counts.websites += 1;
          } else if (ingestType === 'file') {
            counts.files += 1;
          }
        });

        return counts;
      })
    )
  }

  projects = {
    subprojectCount: this.__projectList.asObservable().pipe(
      map(projects => projects.length)
    )
  }

  constructor(private storage: StorageService,
              private settings: SettingsService,
              private favicon: FaviconService,
              private _projects: ProjectService) {
    settings.app.pipe(
      takeUntil(this.cleanUp),
      tap((app) => {
        try {
          this.projectInheritance = app.projects.ksInherit;
        } catch (e) {
          this.projectInheritance = true;
          this.settings.set({app: {projects: {ksInherit: true}}});
        }
      })
    ).subscribe()

    // When new sources are added, update the list of all sources
    _projects.newSources.pipe(
      takeUntil(this.cleanUp),
      tap((sources) => {
        this.__allKs.next(this.__allKs.value.concat(sources));
      })
    ).subscribe()

    // Get icons for all sources then populate the list
    storage.ksList().then((ksList) => {
      this.favicon.extractFromKsList(ksList).then((ready) => {
        this.__allKs.next(ready);
      });
    });

    this.projectList = _projects.projects;

    _projects.currentProject.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        if (!project) {
          return;
        }
        let ksList: KnowledgeSource[] = [];
        let projectList: KcProject[] = [project];
        let queue: KcProject[] = [project];

        while (queue.length > 0) {
          let p = queue.shift();
          if (p && p.knowledgeSource) {
            ksList = ksList.concat(p.knowledgeSource);
          }

          if (p && this.projectInheritance) {
            for (let sub of p.subprojects) {
              let s = this._projects.getProject(sub);
              if (s) {
                queue.push(s);
                projectList.push(s);
              }
            }
          }
        }

        this.__projectList.next(projectList);

        this.favicon.extractFromKsList(ksList).then((ready) => {
          this.__ksList.next(ready);
        })
      })
    ).subscribe()
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }
}
