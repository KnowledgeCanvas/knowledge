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
import {ProjectModel} from "src/app/models/project.model";
import {KnowledgeSource} from "src/app/models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly KC_CURRENT_PROJECT = 'current-project';
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
      console.warn('No projects available...');
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

          // TODO : this is a temporary fix after refactoring ks timelines, should be removed eventually...
          if (!ks.dateAccessed) {
            ks.dateAccessed = [];
          }
          if (!ks.dateModified) {
            ks.dateModified = [];
          }
          if (!ks.dateCreated) {
            ks.dateCreated = new Date();
          }

          ks.dateCreated = new Date(ks.dateCreated);

          let accessed = [];
          for (let d of ks.dateAccessed) {
            accessed.push(new Date(d));
          }
          ks.dateAccessed = accessed;

          let modified = [];
          for (let d of ks.dateModified) {
            modified.push(new Date(d));
          }
          ks.dateModified = modified;
          ks.dateDue = ks.dateDue ? new Date(ks.dateDue) : ks.dateDue;
          ks.associatedProject = project.id;
          ks.icon = undefined;
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
    let pids = [];
    for (let project of projectModels) {
      pStr = JSON.stringify(project);
      this.db.setItem(project.id.value, pStr);
      pids.push(project.id.value);
    }
    this.db.setItem(this.KC_ALL_PROJECT_IDS, JSON.stringify(pids));
  }

  get kcCurrentProject(): string | null {
    return this.db.getItem(this.KC_CURRENT_PROJECT);
  }

  set kcCurrentProject(id: string | null) {
    if (id === null) {
      this.db.setItem(this.KC_CURRENT_PROJECT, '');
      return;
    }
    this.db.setItem(this.KC_CURRENT_PROJECT, id);
  }

  get ksList(): KnowledgeSource[] {
    let projectIdsStr: string | null = this.db.getItem(this.KC_ALL_PROJECT_IDS);

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
      let projectStr = this.db.getItem(projectId);
      if (!projectStr)
        break;
      project = JSON.parse(projectStr);
      if (project.knowledgeSource)
        for (let ks of project.knowledgeSource)
          ksList.push(ks);
    }

    return ksList;
  }

  async getProjects() {
    if (this.projectList)
      return this.projectList;
    return this.projects;
  }

  async saveProject(project: ProjectModel) {
    // Update project in local cache
    let idx = this.projectList?.findIndex(p => p.id.value === project.id.value);

    if (idx === -1) { // If project does not exist in memory, add it
      if (this.projectList)
        this.projectList.push(project);
      else
        this.projectList = [project];

    } else { // Otherwise update the project in-place
      if (this.projectList && idx && idx) {
        this.projectList[idx] = project;
      }
    }

    // Update the project in database
    await this.updateProject(project);

    // Get list of all project IDs from local storage
    let projectList: string[] = [];
    let projectListString = this.db.getItem(this.KC_ALL_PROJECT_IDS);
    if (projectListString) {
      projectList = JSON.parse(projectListString);
    }

    if (projectList.length > 0) {
      let id = projectList.find(item => item === project.id.value);
      // Check if project ID is in the list. If it's not, add it, otherwise continue
      if (!id) {
        projectList.push(project.id.value);
        projectListString = JSON.stringify(projectList);
        this.db.setItem(this.KC_ALL_PROJECT_IDS, projectListString);
      }
    } else {
      // If there is no project list, create one and add project to it
      projectList.push(project.id.value);
      projectListString = JSON.stringify(projectList);
      this.db.setItem(this.KC_ALL_PROJECT_IDS, projectListString);
    }
  }

  saveProjectList(projects: ProjectModel[]) {
    for (let project of projects) {
      this.saveProject(project);
    }
  }

  async updateProject(project: ProjectModel) {
    let projectString = JSON.stringify(project);
    this.db.setItem(project.id.value, projectString);
  }

  deleteProject(id: string) {
    if (!this.projectList) {
      console.warn('StorageService: attempting to delete a project that does not exist in memory.');
      return;
    }

    // Remove project from list
    this.projectList = this.projectList.filter(p => p.id.value !== id);

    // Remove project saved under this string.
    this.db.removeItem(id);

    // Persist changes
    let projectIds: string[] = [];
    for (let project of this.projectList) {
      projectIds.push(project.id.value);
    }
    let projectListStr = JSON.stringify(projectIds);
    this.db.setItem(this.KC_ALL_PROJECT_IDS, projectListStr);
  }

  export() {
    console.warn('Export functionality not implemented...');
  }

  deleteKnowledgeSource(ks: KnowledgeSource) {
    this.db.removeItem(`icon-${ks.id.value}`);
  }
}
