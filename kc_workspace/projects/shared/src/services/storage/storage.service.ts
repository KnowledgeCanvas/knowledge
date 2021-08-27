import {Injectable} from '@angular/core';
import {ProjectModel} from "../../models/project.model";
import {UuidModel} from "../../models/uuid.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly KC_CURRENT_PROJECT = 'current-project';
  readonly KS_CUSTOM_SORT_INDEX = 'ks-custom-sort-index';
  readonly KS_SORT_INDEX = 'ks-sort-index';
  private KC_PROJECTS_KEY = 'kc-projects';

  constructor() {
  }

  get sortByIndex(): number | undefined {
    let idxStr = window.localStorage.getItem(this.KS_SORT_INDEX);
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
    window.localStorage.setItem(this.KS_SORT_INDEX, `${index}`);
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
    let projectListString = window.localStorage.getItem(this.KC_PROJECTS_KEY);
    let projectList: string[] = [];
    if (projectListString) {
      projectList = JSON.parse(projectListString);
    }

    if (projectList?.length > 0) {
      let id = projectList.find(item => item === project.id.value);
      if (!id) {
        projectList.push(project.id.value);
        projectListString = JSON.stringify(projectList);
        window.localStorage.setItem(this.KC_PROJECTS_KEY, projectListString);
      }
    } else {
      projectList.push(project.id.value);
      projectListString = JSON.stringify(projectList);
      window.localStorage.setItem(this.KC_PROJECTS_KEY, projectListString);
    }
  }

  saveProjectList(projects: ProjectModel[]) {
    for (let project of projects) {
      this.saveProject(project);
    }
  }

  deleteProject(id: string) {
    let projectList: string[] = JSON.parse(<string>window.localStorage.getItem(this.KC_PROJECTS_KEY));
    if (projectList) {
      // Remove ID from project list
      projectList = projectList.filter(p => p !== id);

      // Convert new list to string
      let projectListStr = JSON.stringify(projectList);

      // Save in local storage
      window.localStorage.setItem(this.KC_PROJECTS_KEY, projectListStr);

      // Remove project saved under this string.
      window.localStorage.removeItem(id);
    }
  }
}
