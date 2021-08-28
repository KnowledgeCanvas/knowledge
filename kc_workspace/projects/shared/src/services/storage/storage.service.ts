import {Injectable} from '@angular/core';
import {ProjectModel} from "../../models/project.model";
import {UuidModel} from "../../models/uuid.model";
import {KnowledgeSource} from "../../models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly KC_CURRENT_PROJECT = 'current-project';
  readonly KS_CUSTOM_SORT_INDEX = 'ks-custom-sort-index';
  readonly KS_LIST_SORT_INDEX = 'ks-sort-index';
  private KC_ALL_PROJECT_IDS = 'kc-projects';

  constructor() {
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
    if (id === null)
      return;
    // TODO: implement UUID verification somehow...
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
    let projectString = JSON.stringify(project);
    window.localStorage.setItem(project.id.value, projectString);

    let projectListString = window.localStorage.getItem(this.KC_ALL_PROJECT_IDS);
    let projectList: string[] = [];
    if (projectListString) {
      projectList = JSON.parse(projectListString);
    }

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
