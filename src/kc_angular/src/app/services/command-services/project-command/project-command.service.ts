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
