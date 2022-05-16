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
import {ProjectTree, ProjectTreeNode} from "src/app/models/project.tree.model";
import {BehaviorSubject, Observable} from 'rxjs';
import {KcProject, ProjectCreationRequest, ProjectUpdateRequest} from "src/app/models/project.model";
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {UuidService} from "../../ipc-services/uuid-service/uuid.service";
import {UUID} from "src/app/models/uuid";
import {StorageService} from "../../ipc-services/storage-service/storage.service";
import {KcProjectType} from "../../../../../../kc_shared/models/project.model";
import {EventModel} from "../../../../../../kc_shared/models/event.model";

export interface ProjectIdentifiers {
  id: string;
  title: string;
}

export interface ProjectNavigationCommand {
  navigateTo: string
  navigateFrom: string
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private allProjects: BehaviorSubject<ProjectTreeNode[]> = new BehaviorSubject<ProjectTreeNode[]>([]);
  projectTree: Observable<ProjectTreeNode[]> = this.allProjects.asObservable();

  private selectedSource = new BehaviorSubject<KcProject | null>(null);
  currentProject = this.selectedSource.asObservable();

  private allProjectModels: BehaviorSubject<KcProject[]> = new BehaviorSubject<KcProject[]>([]);
  projects = this.allProjectModels.asObservable();

  private tree: ProjectTree;
  private projectSource: KcProject[] = [];
  private lookup: Map<string, KcProject>;
  private _projectCommands: ProjectNavigationCommand[] = [];
  private _projectCommandIndex: number = 0;

  constructor(private storageService: StorageService,
              private uuidService: UuidService) {
    this.allProjects = new BehaviorSubject<ProjectTreeNode[]>([]);
    this.projectTree = this.allProjects.asObservable();
    this.tree = new ProjectTree();
    this.lookup = new Map();
    this.projectSource = [];
    this.refreshTree();
  }

  /**
   * Returns a list of Project types. The first element is guaranteed to be the default type
   * @constructor
   */
  get ProjectTypes(): { code: KcProjectType, name: string }[] {
    return [
      {code: 'default', name: 'Default'},
      {code: 'school', name: 'School'},
      {code: 'hobby', name: 'Hobby'},
      {code: 'work', name: 'Work'}
    ];
  }

  get projectCommandCanGoBack() { // TODO: implement correctly
    return this._projectCommands.length > 0 && this._projectCommandIndex > 0;
  }

  get projectCommandCanGoForward(): boolean { // TODO: implement correctly
    return false;
  }

  get ProjectIdentifiers(): ProjectIdentifiers[] {
    let ids: ProjectIdentifiers[] = [];
    for (let project of this.projectSource) {
      let id: ProjectIdentifiers = {
        id: project.id.value,
        title: project.name
      }
      ids.push(id);
    }
    return ids;
  }

  projectCommandNavigate(id: string) { // TODO: implement correctly
    this.setCurrentProject(id);
    //
    // console.log(`Navigate to ${id} with current index ${this._projectCommandIndex} with command list: `, this._projectCommands);
    //
    // if (id === this.getCurrentProjectId().value) {
    //   return;
    // }
    //
    // if (this._projectCommandIndex !== this._projectCommands.length) {
    //   // If we are not at the end of the command list, we need to modify it
    //   this._projectCommands.length = this._projectCommandIndex - 1;
    // }
    //
    // console.log('Pushing project commands...');
    // this._projectCommands.push({navigateTo: id, navigateFrom: this.getCurrentProjectId().value});
    // console.log('Pushing project commands...', this._projectCommands);
    // this._projectCommandIndex = this._projectCommands.length - 1;
    // this.setCurrentProject(id);
  }

  projectCommandGoBack() { // TODO: implement correctly
    let currentCommand = this._projectCommands[this._projectCommandIndex];
    this._projectCommandIndex -= 1;
    this.setCurrentProject(currentCommand.navigateFrom);
  }

  projectCommandGoForward() { // TODO: implement correctly

  }

  async refreshTree() {
    this.lookup = new Map();
    this.tree = new ProjectTree();

    this.getAllProjects().then((projects: KcProject[]) => {
        this.projectSource = [];
        for (const project of projects) {
          this.lookup.set(project.id.value, project);
          if (!project.parentId?.value) {
            this.projectSource.unshift(project);
          } else {
            this.projectSource.push(project);
          }
        }
        this.allProjectModels.next(this.projectSource);
        this.buildTree(this.projectSource);
        this.initialize();
      },
      error => {
        console.error('ProjectService: Unable to get projects from source...');
        console.error(error);
      });
  }

  deleteProject(id: UUID | string) {
    if (typeof id !== 'string') {
      id = id.value;
    }
    console.debug('ProjectService.deleteProject(id) [recursive] | id === ', id);

    this.recursiveDelete(id);

    // If we are deleting the active project
    if (this.storageService.kcCurrentProject === id) {

      // If there are other projects available, choose the first one as active
      if (this.projectSource.length > 0) {
        this.storageService.kcCurrentProject = this.projectSource[0].id.value;
      }

      // Otherwise there are no other projects so set current to null
      else {
        this.storageService.kcCurrentProject = null;
      }
    }

    // Set default project if no projects left
    if (this.projectSource.length === 0) {
      this.selectedSource.next(null);
    }

    // Refresh tree with new data
    this.refreshTree();
  }

  async getAllProjects(): Promise<KcProject[]> {
    return new Promise((resolve) => {
      resolve(this.storageService.getProjects());
    });
  }

  async newProject(project: ProjectCreationRequest) {
    // Generate UUID
    let uuid: UUID[] = this.uuidService.generate(1);
    let projectId: UUID = uuid[0];

    let newProject: KcProject = {
      calendar: project.calendar ? project.calendar : {events: [], start: null, end: null},
      dateCreated: new Date(),
      dateAccessed: new Date(),
      dateModified: new Date(),
      authors: project.authors,
      description: project.description,
      events: [],
      expanded: true,
      id: projectId,
      knowledgeSource: project.knowledgeSource,
      name: "",
      parentId: project.parentId,
      subprojects: [],
      topics: project.topics,
      type: project.type
    }

    let subProjects: KcProject[] = [];

    if (project.subProjects && project.subProjects.length > 0) {
      uuid = this.uuidService.generate(project.subProjects.length);

      for (let i = 0; i < project.subProjects.length; i++) {
        let subRequest = project.subProjects[i];
        let newSubProject = {
          authors: [],
          calendar: {events: [], start: null, end: null},
          dateAccessed: new Date(),
          dateCreated: new Date(),
          dateModified: new Date(),
          description: "",
          events: [],
          expanded: true,
          id: uuid[i],
          knowledgeSource: subRequest.knowledgeSource,
          name: subRequest.name,
          parentId: subRequest.parentId,
          subprojects: [],
          topics: subRequest.topics,
          type: subRequest.type
        }

        subProjects.push(newSubProject);
        newProject.subprojects.push(newSubProject.id.value);
      }
    }

    this.projectSource.push(newProject);
    await this.storageService.saveProject(newProject);

    for (let subProject of subProjects) {
      this.projectSource.push(subProject);
      await this.storageService.saveProject(subProject);
    }

    if (project.parentId?.value) {
      let parent = this.getProject(project.parentId.value);

      if (parent && parent.subprojects && parent.subprojects.length > 0) {
        parent.subprojects.push(newProject.id.value);
      } else if (parent) {
        parent.subprojects = [newProject.id.value];
      } else {
        console.error('Parent project not found <newProject>: ', project.parentId);
      }
      if (parent) {
        parent.expanded = true;
        await this.storageService.saveProject(parent);
      }
    }
    this.storageService.kcCurrentProject = newProject.id.value;
    this.refreshTree();
  }

  /**
   *
   * @param projectUpdates: ProjectUpdateRequest list that contains one or more project updates
   *
   * To update a project that was already modified, submit an update with only the ID.
   *
   * Otherwise, include any of the valid ProjectUpdateRequest fields.
   * e.g. create an update with ID (required) and an array removeKnowledgeSource[], etc.
   */
  async updateProjects(projectUpdates: ProjectUpdateRequest[]) {
    for (let projectUpdate of projectUpdates) {
      // Make sure the target project exists
      let projectToUpdate = this.projectSource.find(p => p.id.value === projectUpdate.id.value);

      if (!projectToUpdate) {
        console.error(`Attempting to update non-existant project with ID:`, projectUpdate.id.value);
        return;
      }

      if (projectUpdate.name && projectUpdate.name !== projectToUpdate.name) {
        projectToUpdate.name = projectUpdate.name;
      }

      projectToUpdate.expanded = projectUpdate.expanded ?? false;

      // Handle parentId update
      if (projectUpdate.parentId) {
        projectToUpdate.parentId = new UUID(projectUpdate.parentId);
      }

      // Handle add subproject update
      if (projectUpdate.addSubprojects && projectUpdate.addSubprojects.length) {
        if (projectToUpdate.subprojects) {
          for (let subp of projectUpdate.addSubprojects) {
            projectToUpdate.subprojects.push(subp);
          }
        }
      }

      // Handle remove subproject update
      if (projectUpdate.removeSubprojects && projectUpdate.removeSubprojects.length) {
        for (let subp of projectUpdate.removeSubprojects) {
          if (projectToUpdate.subprojects)
            projectToUpdate.subprojects = projectToUpdate.subprojects.filter(s => s !== subp);
        }
      }

      // Handle knowledge source removal
      if (projectUpdate.removeKnowledgeSource && projectUpdate.removeKnowledgeSource.length) {
        projectToUpdate = this.removeKnowledgeSource(projectToUpdate, projectUpdate.removeKnowledgeSource);
      }

      // Handle moving knowledge source from project to project
      if (projectUpdate.moveKnowledgeSource) {
        projectToUpdate = this.moveKnowledgeSource(projectToUpdate, projectUpdate.moveKnowledgeSource);
      }

      // Handle knowledge source insertion
      if (projectUpdate.addKnowledgeSource && projectUpdate.addKnowledgeSource.length) {
        projectToUpdate = this.addKnowledgeSource(projectToUpdate, projectUpdate.addKnowledgeSource);
      }

      // Handle knowledge source update
      if (projectUpdate.updateKnowledgeSource && projectUpdate.updateKnowledgeSource.length > 0) {
        projectToUpdate = this.updateKnowledgeSource(projectToUpdate, projectUpdate.updateKnowledgeSource);
      }

      // Handle topic insertion
      if (projectUpdate.addTopic && projectUpdate.addTopic.length > 0) {
        if (!projectToUpdate.topics)
          projectToUpdate.topics = [];
        for (let topic of projectUpdate.addTopic)
          projectToUpdate.topics.push(topic);
      }

      // Handle topic removal
      if (projectUpdate.removeTopic && projectUpdate.removeTopic.length > 0) {
        if (projectToUpdate.topics) {
          let removeTopics: string[] = projectUpdate.removeTopic;
          for (let topic of removeTopics) {
            projectToUpdate.topics = projectToUpdate.topics.filter(t => t !== topic);
          }
        }
      }

      if (projectUpdate.overWriteTopics && projectUpdate.overWriteTopics.length > 0) {
        projectToUpdate.topics = projectUpdate.overWriteTopics;
      }

      let event: EventModel = {
        description: "",
        id: projectToUpdate.id,
        type: 'update',
        timestamp: Date()
      }
      projectToUpdate.calendar.events.push(event);
      projectToUpdate.dateModified = new Date();

      if (projectToUpdate.knowledgeSource) {
        for (let ks of projectToUpdate.knowledgeSource) {
          ks.associatedProject = projectToUpdate.id;
        }
      }

      // Persist project to storage system
      await this.storageService.updateProject(projectToUpdate);

      this.projectSource = this.projectSource.filter(p => p.id.value !== projectUpdate.id.value);
      this.projectSource.push(projectToUpdate);
    }

    this.refreshTree();
  }

  setCurrentProject(id: string | null): void {
    if (!id) {
      this.setDefaultProject();
      return;
    }

    let project = this.projectSource.find(p => p.id.value === id);

    if (project) {
      // Update access date any time a project is viewed
      project.dateAccessed = new Date();

      // Set current project and notify subscribers
      this.selectedSource.next(project);

      // Persist project to storage system
      this.storageService.updateProject(project);

      // Persist active project ID to storage system
      this.storageService.kcCurrentProject = project.id.value;
    } else {
      this.setDefaultProject();
      console.error('ProjectService failed to find ID in setCurrentProject: ', id);
    }
  }

  getCurrentProjectId(): UUID | null {
    return this.selectedSource.value?.id ?? null;
  }

  getProject(id: UUID | string): KcProject | undefined {
    if (typeof id !== 'string') {
      id = id.value;
    }

    for (let project of this.projectSource) {
      if (project.id.value === id)
        return project;
    }
    return undefined;
  }

  getSubTree(id: UUID | string): ProjectIdentifiers[] {
    if (typeof id !== 'string') {
      id = id.value;
    }

    let project = this.projectSource.find(k => k.id.value === id);
    let ret: ProjectIdentifiers[] = [];
    if (!project) {
      console.error('Attempting to find project that doesn\'t exist with ID: ', id);
      return ret;
    }

    ret.push({id: project.id.value, title: project.name});
    if (project.subprojects && project.subprojects.length > 0) {
      for (let subProjectId of project.subprojects) {
        ret = ret.concat(this.getSubTree(subProjectId));
      }
    }
    return ret;
  }

  getAncestors(id: string): ProjectIdentifiers[] {
    let project = this.projectSource.find(k => k.id.value === id);
    let ret: ProjectIdentifiers[] = [];
    if (!project) {
      console.error('Attempting to find project that doesn\'t exist with ID: ', id);
      return ret;
    }

    ret.push({id: project.id.value, title: project.name});
    if (project.parentId && project.parentId.value !== '') {
      ret = [...this.getAncestors(project.parentId.value), ...ret];
    }
    return ret;
  }

  setAllExpanded(expanded: boolean) {
    for (let project of this.projectSource) {
      project.expanded = expanded;
    }
    this.storageService.saveProjectList(this.projectSource);
  }

  private setDefaultProject() {
    if (this.projectSource.length > 0) {
      this.selectedSource.next(this.projectSource[0]);
      this.storageService.kcCurrentProject = this.projectSource[0].id.value;
    } else {
      this.selectedSource.next(null);
      this.storageService.kcCurrentProject = null;
    }
  }

  private recursiveDelete(id: string) {
    let project = this.projectSource.find(p => p.id.value === id);

    if (!project) {
      console.error('Project not found <recursive delete>: ', id);
      return;
    }

    for (let ks of project.knowledgeSource) {
      this.storageService.deleteKnowledgeSource(ks);
    }

    if (project.parentId) {
      let parent = this.projectSource.find(p => p.id.value === project?.parentId?.value);
      if (parent && parent.subprojects) {
        parent.subprojects = parent.subprojects.filter(p => p !== id);
        this.storageService.updateProject(parent);
      }
    }

    if (project.subprojects && project.subprojects.length > 0) {
      for (let subProject of project.subprojects) {
        this.recursiveDelete(subProject);
      }
    }

    this.projectSource = this.projectSource.filter(item => item.id.value !== id);

    console.warn('Deleting project: ', project);

    this.storageService.deleteProject(id);
  }

  private initialize(): void {
    const data = this.buildFileTree(this.tree.asArray(), 0);
    this.allProjects.next(data);
    let currentProject = this.storageService.kcCurrentProject;

    if (currentProject) {
      let found = this.projectSource.find(p => p.id.value === currentProject);
      if (found)
        this.setCurrentProject(currentProject);
      else
        this.setCurrentProject(null);
    }
  }

  private buildFileTree(source: ProjectTreeNode[], level: number): ProjectTreeNode[] {
    const tree: ProjectTreeNode[] = [];

    for (const node of source) {
      if (node.subprojects.length > 0) {
        this.buildFileTree(node.subprojects, level + 1);
      }
      tree.push(node);
    }
    return tree;
  }

  private buildTree(input: KcProject[]): void {
    const visited = new Map<string, boolean>();

    for (const model of input) {
      if (model?.id && !visited.get(model.id.value)) {
        const node = this.modelToNode(model);

        if (model.subprojects)
          for (const subId of model.subprojects) {
            const sub: KcProject | undefined = this.lookup.get(subId);
            if (sub) {
              node.subprojects.push(this.modelToNode(sub));
              visited.set(subId, true);
            }
          }
        this.tree.add(node, model.parentId?.value);
        visited.set(node.id, true);
      }
    }
  }

  private modelToNode(model: KcProject): ProjectTreeNode {
    return new ProjectTreeNode(model.name, model.id.value, 'project', [], model.expanded);
  }

  private addKnowledgeSource(project: KcProject, add: KnowledgeSource[]): KcProject {
    // Assume knowledge source icons have not been persisted to local memory yet...
    // TODO: this would be better suited for StorageService
    for (let ks of add) {
      if (ks.ingestType === 'file') {
        localStorage.setItem(`icon-${ks.id.value}`, ks.icon);
      }
    }

    if (!project.knowledgeSource || project.knowledgeSource.length === 0) {
      project.knowledgeSource = add;
    } else {
      let ksList: KnowledgeSource[] = [];
      for (let addKs of add) {
        let found = project.knowledgeSource.find(k => k.id.value === addKs.id.value);
        if (!found) {
          addKs.associatedProject = project.id;
          ksList.push(addKs);
        } else
          console.warn('ProjectService: Invalid request to add duplicate knowledge source to project ', project.name);
      }
      project.knowledgeSource = [...project.knowledgeSource, ...ksList];
    }
    return project;
  }

  private removeKnowledgeSource(project: KcProject, remove: KnowledgeSource[]): KcProject {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      for (let toRemove of remove) {
        localStorage.removeItem(`icon-${toRemove.id.value}`);
        project.knowledgeSource = project.knowledgeSource.filter(ks => ks.id.value !== toRemove.id.value);
      }
    } else {
      console.error(`Attempting to remove ${remove.length} knowledge source(s) from project with no knowledge sources...`);
    }
    return project;
  }

  private moveKnowledgeSource(project: KcProject, move: { ks: KnowledgeSource, new: UUID }): KcProject {
    const newProject = this.projectSource.find(p => p.id.value === move.new.value);
    if (!newProject) {
      return project;
    }
    move.ks.associatedProject = newProject.id;
    if (!move.ks.events) {
      move.ks.events = [];
    }
    move.ks.events.push({
      date: new Date(),
      label: `Moved`
    });
    newProject.knowledgeSource.push(move.ks);
    this.storageService.updateProject(newProject);

    // Remove ks from old project and return
    project.knowledgeSource = project.knowledgeSource.filter(k => k.id.value !== move.ks.id.value);
    return project;
  }

  private updateKnowledgeSource(project: KcProject, update: KnowledgeSource[]): KcProject {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      for (let ks of update) {
        // Make sure the item does not already exist in the project
        let idx = project.knowledgeSource.findIndex(p => p.id.value === ks.id.value);
        if (idx >= 0) {
          project.knowledgeSource[idx] = ks;
        } else {
          console.error('Error attempting to update Knowledge Source with no matching ID...');
        }
      }
    }
    return project;
  }
}
