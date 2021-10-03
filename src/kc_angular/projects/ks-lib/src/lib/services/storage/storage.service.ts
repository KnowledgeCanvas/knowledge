/**
 Copyright 2021 Rob Royce

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
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly KC_CURRENT_PROJECT = 'current-project';
  readonly KS_CUSTOM_SORT_INDEX = 'ks-custom-sort-index';
  readonly KS_LIST_SORT_INDEX = 'ks-sort-index';
  private KC_ALL_PROJECT_IDS = 'kc-projects';
  private db = window.localStorage;
  private knowledgeSources: KnowledgeSource[] | null = null;
  private projectList: ProjectModel[] | null = null;

  constructor() {
  }

  get projects(): ProjectModel[] {
    let projects: ProjectModel[] = [];

    // Get and parse Project list from local storage
    let projectsStr: string | null = this.db.getItem(this.KC_ALL_PROJECT_IDS);

    if (!projectsStr) {
      console.warn('Project list does not exist in storage system, creating...');
      this.db.setItem(this.KC_ALL_PROJECT_IDS, JSON.stringify([]));
      return projects;
    }

    let projectIds: string[] = JSON.parse(projectsStr);

    if (!projectIds) {
      console.warn('Could not deserialize Project list JSON template... ');
      return projects;
    }

    if (projectIds.length === 0) {
      return projects;
    }

    let pStr: string | null = null;
    let project: ProjectModel | null = null;

    // Deserialize projects from list of Project IDs
    for (let pId of projectIds) {
      pStr = this.db.getItem(pId);
      if (!pStr) {
        console.warn('Got Project ID from storage that did not point to a valid project...');
        pStr = null;
        continue;
      }

      project = JSON.parse(pStr);
      if (!project) {
        console.warn('Could not deserialize Project JSON template...');
        project = null;
        continue;
      }

      this.knowledgeSources = [];

      // Pre-populate list of Knowledge Sources for later consumption
      if (project.knowledgeSource && project.knowledgeSource.length > 0) {
        for (let ks of project.knowledgeSource) {
          // Fix for invalid serialize/deserialize formatting
          ks.dateModified = new Date(ks.dateModified);
          ks.dateAccessed = new Date(ks.dateAccessed);
          ks.dateCreated = new Date(ks.dateCreated);
          this.knowledgeSources.push(ks);
        }
      }
      projects.push(project);
    }

    if (projects.length > 0) {
      this.projectList = projects;
    } else {
      this.projectList = null;
    }

    return projects;
  }

  set projects(projectModels: ProjectModel[]) {
    let pStr: string;
    for (let project of projectModels) {
      pStr = JSON.stringify(project);
      this.db.setItem(project.id.value, pStr);
    }
    pStr = JSON.stringify(projectModels);
    this.db.setItem(this.KC_ALL_PROJECT_IDS, pStr);
  }

  get sortByIndex(): number | undefined {
    let idxStr = window.localStorage.getItem(this.KS_LIST_SORT_INDEX);
    if (idxStr) {
      let idx: number = +idxStr;
      if (idx && idx > 0)
        return idx
    }
    return undefined;
  }

  set sortByIndex(index: number | undefined) {
    if (index === undefined)
      return;
    window.localStorage.setItem(this.KS_LIST_SORT_INDEX, `${index}`);
  }

  get kcCurrentProject(): string | null {
    return window.localStorage.getItem(this.KC_CURRENT_PROJECT);
  }

  set kcCurrentProject(id: string | null) {
    if (id === null) {
      this.db.setItem(this.KC_CURRENT_PROJECT, '');
      return;
    }
    window.localStorage.setItem(this.KC_CURRENT_PROJECT, id);
  }

  get ksList(): KnowledgeSource[] {
    let projectIdsStr: string | null = window.localStorage.getItem(this.KC_ALL_PROJECT_IDS);

    if (projectIdsStr === null) {
      console.warn('Attempted to retrieve project ID list but failed.');
      return [];
    }

    let projectIds = JSON.parse(projectIdsStr);
    if (!projectIds) {
      console.warn('Could not parse project IDs.');
      return [];
    }

    let ksList: KnowledgeSource[] = [];
    for (let projectId of projectIds) {
      let project: ProjectModel;
      let projectStr = window.localStorage.getItem(projectId);
      if (!projectStr)
        break;
      project = JSON.parse(projectStr);
      if (project.knowledgeSource)
        for (let ks of project.knowledgeSource)
          ksList.push(ks);
    }

    return ksList;
  }

  get sortByCustom(): UuidModel[] | undefined {
    let lookup = `${this.KS_CUSTOM_SORT_INDEX}-${this.kcCurrentProject}`
    let customStr = window.localStorage.getItem(lookup);
    if (customStr) {
      let custom: UuidModel[] = JSON.parse(customStr);
      if (custom)
        return custom;
    }
    return undefined;
  }

  set sortByCustom(idx: UuidModel[] | undefined) {
    if (idx === undefined)
      return;

    let lookup = `${this.KS_CUSTOM_SORT_INDEX}-${this.kcCurrentProject}`
    let idxStr = JSON.stringify(idx);
    window.localStorage.setItem(lookup, idxStr);
  }

  saveProject(project: ProjectModel) {
    // Update initial project
    this.updateProject(project);

    // Get list of all projects
    let projectListString = window.localStorage.getItem(this.KC_ALL_PROJECT_IDS);
    let projectList: string[] = [];
    if (projectListString) {
      projectList = JSON.parse(projectListString);
    }

    // Update list of projects to include
    if (projectList?.length > 0) {
      let id = projectList.find(item => item === project.id.value);
      if (!id) {
        projectList.push(project.id.value);
        projectListString = JSON.stringify(projectList);
        window.localStorage.setItem(this.KC_ALL_PROJECT_IDS, projectListString);
      }
    } else {
      projectList.push(project.id.value);
      projectListString = JSON.stringify(projectList);
      window.localStorage.setItem(this.KC_ALL_PROJECT_IDS, projectListString);
    }
  }

  saveProjectList(projects: ProjectModel[]) {
    for (let project of projects) {
      this.saveProject(project);
    }
  }

  updateProject(project: ProjectModel) {
    let projectString = JSON.stringify(project);
    window.localStorage.setItem(project.id.value, projectString);
  }

  deleteProject(id: string) {
    let projectList: string[] = JSON.parse(<string>window.localStorage.getItem(this.KC_ALL_PROJECT_IDS));
    if (projectList) {
      // Remove ID from project list
      projectList = projectList.filter(p => p !== id);

      // Convert new list to string
      let projectListStr = JSON.stringify(projectList);

      // Save in local storage
      window.localStorage.setItem(this.KC_ALL_PROJECT_IDS, projectListStr);

      // Remove project saved under this string.
      window.localStorage.removeItem(id);
    }
  }

  factoryReset(confirmed: boolean) {
    if (confirmed) {
      window.localStorage.clear();
    } else {
      console.warn('Factory reset was called with a false flag.');
    }
  }

  deleteFile(id: string | 'delete-all-files') {
    if (id === 'delete-all-files') {
      console.warn('Deleting all files and associated sources...');
    } else {
      console.error('File deletion not implemented yet...');
    }
  }
}
