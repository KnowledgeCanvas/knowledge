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
import {ProjectTree, ProjectTreeNode} from "projects/ks-lib/src/lib/models/project.tree.model";
import {BehaviorSubject, Observable} from 'rxjs';
import {ProjectCreationRequest, ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {UuidService} from "../uuid/uuid.service";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {StorageService} from "../storage/storage.service";
import {KcCalendar} from "../../models/calendar.model";

export interface ProjectIdentifiers {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private allProjects: BehaviorSubject<ProjectTreeNode[]> = new BehaviorSubject<ProjectTreeNode[]>([]);
  projectTree: Observable<ProjectTreeNode[]> = this.allProjects.asObservable();
  private selectedSource = new BehaviorSubject<ProjectModel>(new ProjectModel('', {value: ''}, 'default'));
  currentProject = this.selectedSource.asObservable();
  private tree: ProjectTree;
  private projectSource: ProjectModel[] = [];
  private lookup: Map<string, ProjectModel>;


  constructor(private storageService: StorageService, private uuidService: UuidService) {
    this.allProjects = new BehaviorSubject<ProjectTreeNode[]>([]);
    this.projectTree = this.allProjects.asObservable();
    this.tree = new ProjectTree();
    this.lookup = new Map();
    this.projectSource = [];
    this.refreshTree();
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

  refreshTree(): void {
    this.lookup = new Map();
    this.tree = new ProjectTree();

    this.getAllProjects().then((projects: ProjectModel[]) => {
        this.projectSource = [];
        for (const project of projects) {
          this.lookup.set(project.id.value, project);
          if (!project.parentId?.value) {
            this.projectSource.unshift(project);
          } else {
            this.projectSource.push(project);
          }
        }
        this.buildTree(this.projectSource);
        this.initialize();
      },
      error => {
        console.error('ProjectService: Unable to get projects from source...');
        console.error(error);
      });
  }


  deleteProject(id: string) {
    this.recursiveDelete(id);

    // Propagate update to storage system if applicable
    if (this.storageService.kcCurrentProject === id) {
      if (this.projectSource.length > 0) {
        this.storageService.kcCurrentProject = this.projectSource[0].id.value;
      } else {
        this.storageService.kcCurrentProject = null;
      }
    }

    // Set default project is no projects left
    if (this.projectSource.length === 0) {
      this.selectedSource.next(new ProjectModel('', {value: ''}, 'default'))
    }

    // Refresh tree with new data
    this.refreshTree();
  }

  getAllProjects(): Promise<ProjectModel[]> {
    return new Promise((resolve) => {
      let projectList = this.storageService.projects;
      resolve(projectList);
    });
  }

  newProject(project: ProjectCreationRequest): any {
    let uuid: UuidModel[] = this.uuidService.generate(1);

    let projectId: UuidModel = uuid[0];

    let newProject = new ProjectModel(project.name, projectId, project.type, project.parentId);
    newProject.topics = project.topics;
    newProject.knowledgeSource = project.knowledgeSource;
    newProject.authors = project.authors;
    newProject.description = project.description;
    newProject.calendar = project.calendar ? project.calendar : new KcCalendar();

    let subProjects: ProjectModel[] = [];

    if (project.subProjects && project.subProjects.length > 0) {
      uuid = this.uuidService.generate(project.subProjects.length);
      newProject.subprojects = [];

      for (let i = 0; i < project.subProjects.length; i++) {
        let subRequest = project.subProjects[i];

        let newSubProject = new ProjectModel(subRequest.name, uuid[i], subRequest.type, projectId);
        newSubProject.topics = subRequest.topics;
        newSubProject.knowledgeSource = subRequest.knowledgeSource;
        newSubProject.authors = subRequest.authors;
        newSubProject.description = subRequest.description;

        subProjects.push(newSubProject);
        newProject.subprojects.push(newSubProject.id.value);
      }
    }

    this.projectSource.push(newProject);
    this.storageService.saveProject(newProject);

    for (let subProject of subProjects) {
      this.projectSource.push(subProject);
      this.storageService.saveProject(subProject);
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
        this.storageService.saveProject(parent);
      }

    }

    this.storageService.kcCurrentProject = newProject.id.value;
    this.refreshTree();
  }

  /**
   *
   * @param projectUpdate: ProjectUpdateRequest
   *
   * To update a project that was already modified, submit an update with only the ID.
   *
   * Otherwise, include any of the valid ProjectUpdateRequest fields.
   * e.g. create an update with ID (required) and an array removeKnowledgeSource[]
   */
  updateProject(projectUpdate: ProjectUpdateRequest) {
    // Make sure the target project exists
    let projectToUpdate = this.projectSource.find(p => p.id.value === projectUpdate.id.value);

    if (!projectToUpdate) {
      console.error(`Project not found: `, projectUpdate.id.value);
      return;
    }

    if (projectUpdate.name && projectUpdate.name !== projectToUpdate.name) {
      projectToUpdate.name = projectUpdate.name;
    }

    // Handle knowledge source removal
    if (projectUpdate.removeKnowledgeSource && projectUpdate.removeKnowledgeSource.length > 0) {
      projectToUpdate = this.removeKnowledgeSource(projectToUpdate, projectUpdate.removeKnowledgeSource);
    }

    // Handle knowledge source insertion
    if (projectUpdate.addKnowledgeSource && projectUpdate.addKnowledgeSource.length > 0) {
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

    projectToUpdate.dateModified = Date();

    if (projectToUpdate.knowledgeSource) {
      for (let ks of projectToUpdate.knowledgeSource) {
        ks.associatedProjects = [projectToUpdate.id];
      }
    }


    // Persist project to storage system
    this.storageService.updateProject(projectToUpdate);

    // Update project source
    this.projectSource = this.projectSource.filter(p => p.id.value !== projectUpdate.id.value);
    this.projectSource.push(projectToUpdate);
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
      project.dateAccessed = Date();

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

  getCurrentProjectId(): UuidModel {
    return this.selectedSource.value.id;
  }

  getProject(id: string): ProjectModel | undefined {
    for (let project of this.projectSource) {
      if (project.id.value === id)
        return project;
    }
    return undefined;
  }

  getSubTree(id: string): ProjectIdentifiers[] {
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
      this.selectedSource.next(new ProjectModel('', {value: ''}, 'default'));
      this.storageService.kcCurrentProject = null;
    }
  }

  private recursiveDelete(id: string) {
    let project = this.projectSource.find(p => p.id.value === id);

    if (!project) {
      console.error('Project not found <recursive delete>: ', id);
      return;
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

  private buildTree(input: ProjectModel[]): void {
    const visited = new Map<string, boolean>();

    for (const model of input) {
      if (model?.id && !visited.get(model.id.value)) {
        const node = this.modelToNode(model);

        if (model.subprojects)
          for (const subId of model.subprojects) {
            const sub: ProjectModel | undefined = this.lookup.get(subId);
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

  private modelToNode(model: ProjectModel): ProjectTreeNode {
    return new ProjectTreeNode(model.name, model.id.value, 'project', []);
  }

  private addKnowledgeSource(project: ProjectModel, add: KnowledgeSource[]): ProjectModel {
    if (!project.knowledgeSource || project.knowledgeSource.length <= 0) {
      project.knowledgeSource = add;
    } else {
      let ksList: KnowledgeSource[] = [];
      for (let addKs of add) {
        let found = project.knowledgeSource.find(k => k.id.value === addKs.id.value);
        if (!found) {
          addKs.associatedProjects = [project.id];
          ksList.push(addKs);
        }
        else
          console.warn('ProjectService: Invalid request to add duplicate knowledge source to project ', project.name);
      }
      project.knowledgeSource = [...project.knowledgeSource, ...ksList];
    }
    return project;
  }

  private removeKnowledgeSource(project: ProjectModel, remove: KnowledgeSource[]): ProjectModel {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      for (let toRemove of remove) {
        project.knowledgeSource = project.knowledgeSource.filter(ks => ks.id.value !== toRemove.id.value);
      }
    } else {
      console.error(`Attempting to remove ${remove.length} knowledge source(s) from project with no knowledge sources...`);
    }
    return project;
  }

  private updateKnowledgeSource(project: ProjectModel, update: KnowledgeSource[]): ProjectModel {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      for (let toUpdate of update) {

        // Make sure the item does not already exist in the project
        let idx = project.knowledgeSource.findIndex(p => p.id.value === toUpdate.id.value);

        if (idx >= 0) {
          project.knowledgeSource[idx] = toUpdate;
        } else {
          console.error('Error attempting to update Knowledge Source with no matching ID...');
        }
      }
    }
    return project;
  }
}
