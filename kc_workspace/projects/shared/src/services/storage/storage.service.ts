import {Injectable} from '@angular/core';
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";
import {BehaviorSubject} from "rxjs";
import {ProjectModel} from "../../models/project.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private ksStorage = new BehaviorSubject<KnowledgeSourceModel[]>([]);

  constructor() {
  }

  saveProject(project: ProjectModel) {
    let projectString = JSON.stringify(project);
    window.localStorage.setItem(project.id.value, projectString);

    let projectListString = window.localStorage.getItem('kc-projects');

    let projectList: string[] = [];

    if (projectListString) {
      projectList = JSON.parse(projectListString);
    }

    console.log('ProjectList: ', projectList);

    if (projectList.length > 0) {
      let id = projectList.find(item => item === project.id.value);
      console.log('Attempting to find project with ID: ', project.id);
      if (!id) {
        projectList.push(project.id.value);
        projectListString = JSON.stringify(projectList);
        console.log('Setting kc-projects to ', projectListString);
        window.localStorage.setItem('kc-projects', projectListString);
      } else {
        console.log('ID Found, not adding...');
      }
    } else {
      projectList.push(project.id.value);
      projectListString = JSON.stringify(projectList);
      console.log('Setting kc-projects to ', projectListString);
      window.localStorage.setItem('kc-projects', projectListString);
    }
  }

  saveProjectList(projects: ProjectModel[]) {
    let projectIdList: string[] = [];
    for (let project of projects) {
      projectIdList.push(project.id.value);
    }
    let projectsString = JSON.stringify(projectIdList);
    if (!projectsString) {
      return;
    }

    window.localStorage.setItem('kc-projects', projectsString);
  }
}
