import {Injectable} from '@angular/core';
import {ProjectTree, ProjectTreeNode} from "projects/ks-lib/src/lib/models/project.tree.model";
import {BehaviorSubject} from 'rxjs';
import {HttpHeaders} from '@angular/common/http';
import {
  ProjectCreationRequest,
  ProjectModel,
  ProjectUpdateRequest
} from "projects/ks-lib/src/lib/models/project.model";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {UuidService} from "../uuid/uuid.service";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {StorageService} from "../storage/storage.service";
import {KcCalendar} from "../../models/calendar.model";

export const contentHeaders = new HttpHeaders()
  .set('Accept', 'application/json')
  .set('Content-Type', 'application/json');

export interface ProjectIdentifiers {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  allProjects: BehaviorSubject<ProjectTreeNode[]>;
  private tree: ProjectTree;
  private projectSource: ProjectModel[] = [];
  private lookup: Map<string, ProjectModel>;
  private selectedSource = new BehaviorSubject<ProjectModel>(new ProjectModel('', {value: ''}, 'default'));
  currentProject = this.selectedSource.asObservable();

  constructor(private storageService: StorageService, private uuidService: UuidService) {
    this.allProjects = new BehaviorSubject<ProjectTreeNode[]>([]);
    this.tree = new ProjectTree();
    this.lookup = new Map();
    this.projectSource = [];

    this.currentProject.subscribe((project) => {
      if (project.id && project.id.value.length > 10)
        this.storageService.kcCurrentProject = project.id.value;
    });

    this.getAllProjects().then((projects: ProjectModel[]) => {
      this.projectSource = projects;
      this.refreshTree();
    });
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
    let mostRecentId = this.storageService.kcCurrentProject;
    if (mostRecentId) {
      let mostRecentProject = this.getProject(mostRecentId);
      if (!mostRecentProject) {
        this.storageService.kcCurrentProject = '';
      }
    }

    this.lookup = new Map();
    this.tree = new ProjectTree();

    this.getAllProjects().then((projects: ProjectModel[]) => {
        this.projectSource = [];
        for (const project of projects) {
          if (project.id.value) {
            this.lookup.set(project.id.value, project);
            if (!project.parentId?.value) {
              this.projectSource.unshift(project);
            } else {
              this.projectSource.push(project);
            }
          }
        }
        this.buildTree(this.projectSource);
        this.initialize();
        // this.setCurrentProject(currentId);
      },
      error => {
        console.error('ProjectService: Unable to get projects from source...');
        console.error(error);
      });
  }

  getAllProjects(): Promise<ProjectModel[]> {
    return new Promise((resolve) => {
      // TODO: change this to use storageService
      let projectListString = window.localStorage.getItem('kc-projects');
      let projectIdList: string[] = [];
      let projectList: ProjectModel[] = [];
      if (projectListString) {
        projectIdList = JSON.parse(projectListString);
      } else {
        console.warn('Could not get project list from kc-projects');
        resolve([]);
      }
      for (let id of projectIdList) {
        let projectString = window.localStorage.getItem(id);
        let project: ProjectModel;
        if (projectString) {
          project = JSON.parse(projectString);

          // TODO: Figure out if we need to create new date objects every time...
          if (project.knowledgeSource && project.knowledgeSource.length > 0) {
            for (let ks of project.knowledgeSource) {
              // setTimeout(() => {
              //   ks.dateModified = new Date();
              //   ks.dateAccessed = new Date();
              //   ks.dateCreated = new Date();
              // }, 2000);
              ks.dateModified = new Date(ks.dateModified);
              ks.dateAccessed = new Date(ks.dateAccessed);
              ks.dateCreated = new Date(ks.dateCreated);
            }
          }
          this.storageService.saveProject(project);

          projectList.push(project);
        }
      }
      resolve(projectList);
    });
  }

  newProject(project: ProjectCreationRequest): any {
    console.log('Creating new project: ', project);

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

    this.setCurrentProject(newProject.id.value);
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

    // Persist project to storage system
    let projectString = JSON.stringify(projectToUpdate);
    window.localStorage.setItem(projectUpdate.id.value, projectString);

    // Update project source
    this.projectSource = this.projectSource.filter(p => p.id.value !== projectUpdate.id.value);
    this.projectSource.push(projectToUpdate);
    this.setCurrentProject(projectUpdate.id.value);
    this.refreshTree();
  }

  setCurrentProject(id: string): void {
    let project = this.projectSource.find(p => p.id.value === id);

    if (project) {
      this.selectedSource.next(project);
    } else {
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

  deleteProject(id: string) {
    this.recursiveDelete(id);
    this.refreshTree();
  }

  setAllExpanded(expanded: boolean) {
    for (let project of this.projectSource) {
      project.expanded = expanded;
    }
    this.storageService.saveProjectList(this.projectSource);
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

  private recursiveDelete(id: string) {
    let project = this.projectSource.find(p => p.id.value === id);
    if (!project) {
      console.error('Project not found <recursive delete>: ', id);
      return;
    }

    if (project.subprojects && project.subprojects.length > 0) {
      for (let subProject of project.subprojects) {
        this.recursiveDelete(subProject);
      }
    }

    this.projectSource = this.projectSource.filter(item => item.id.value !== id);
    this.storageService.deleteProject(id);
  }

  private initialize(): void {
    const data = this.buildFileTree(this.tree.asArray(), 0);
    if (!data)
      return;

    this.allProjects.next(data);
    let currentProject = this.storageService.kcCurrentProject;

    if (currentProject) {
      this.setCurrentProject(currentProject);
    } else {
      if (data && data[0] && data[0].id && data[0].id)
        this.setCurrentProject(data[0].id);
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
    // TODO: eventually make sure there are no duplicates...
    console.log('Adding knowledge source to project: ', add);

    if (project.knowledgeSource && project.knowledgeSource.length > 0)
      project.knowledgeSource = [...project.knowledgeSource, ...add];
    else
      project.knowledgeSource = add;

    return project;
  }

  private removeKnowledgeSource(project: ProjectModel, remove: KnowledgeSource[]): ProjectModel {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      let ksList: KnowledgeSource[] = project.knowledgeSource;
      for (let toRemove of remove) {
        ksList = ksList.filter(p => p.id.value !== toRemove.id.value);
      }
      project.knowledgeSource = ksList;
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

  private updateTopics(project: ProjectModel, topics: string[]) {
    return project;
  }
}
