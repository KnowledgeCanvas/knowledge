import {Injectable} from '@angular/core';
import {ProjectTree, ProjectTreeNode} from "../../models/project.tree.model";
import {BehaviorSubject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ProjectCreationRequest, ProjectModel, ProjectUpdateRequest} from "../../models/project.model";
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";
import {UuidService} from "../uuid/uuid.service";
import {UuidModel} from "../../models/uuid.model";
import {StorageService} from "../storage/storage.service";
import {TopicModel} from "../../models/topic.model";

export const contentHeaders = new HttpHeaders()
  .set('Accept', 'application/json')
  .set('Content-Type', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  allProjects: BehaviorSubject<ProjectTreeNode[]>;
  private URL_PREFIX = 'http://localhost:8000';
  private tree: ProjectTree;
  private projectSource: ProjectModel[] = [];
  private lookup: Map<string, ProjectModel>;
  private selectedSource = new BehaviorSubject<ProjectModel>(new ProjectModel('', {value: ''}, 'default'));
  currentProject = this.selectedSource.asObservable();

  constructor(private http: HttpClient, private uuidService: UuidService, private storageService: StorageService) {
    this.allProjects = new BehaviorSubject<ProjectTreeNode[]>([]);
    this.lookup = new Map();
    this.tree = new ProjectTree();
    this.projectSource = [];
    this.refreshTree();

    this.getAllProjects().then((projects: ProjectModel[]) => {
      this.projectSource = projects;
    });
  }

  get data(): ProjectTreeNode[] {
    return this.allProjects.value;
  }

  refreshTree(): void {
    let currentId: string;
    let mostRecentId = window.localStorage.getItem('current-project');
    if (mostRecentId) {
      currentId = mostRecentId
    } else {
      currentId = this.selectedSource.value.id.value ? this.selectedSource.value.id.value : '';
    }
    this.lookup = new Map();
    this.tree = new ProjectTree();
    this.getAllProjects().then((projects: ProjectModel[]) => {
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
        this.setCurrentProject(currentId);
      },
      error => {
        console.error('ProjectService: Unable to get projects from source...');
        console.error(error);
      });
  }

  initialize(): void {
    const data = this.buildFileTree(this.tree.asArray(), 0);
    this.allProjects.next(data);
    if (data[0]) {
      this.setCurrentProject(data[0].id);
    } else {
      let blankProject = new ProjectModel('', {value: ''}, 'default');
      this.selectedSource.next(blankProject);
      this.setCurrentProject(this.selectedSource?.value?.id.value ? this.selectedSource.value.id.value : '');
    }
  }

  buildFileTree(source: ProjectTreeNode[], level: number): ProjectTreeNode[] {
    const tree: ProjectTreeNode[] = [];
    for (const node of source) {
      if (node.subprojects.length > 0) {
        this.buildFileTree(node.subprojects, level + 1);
      }
      tree.push(node);
    }
    return tree;
  }

  buildTree(input: ProjectModel[]): void {
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

  modelToNode(model: ProjectModel): ProjectTreeNode {
    return new ProjectTreeNode(model.name, model.id.value, 'project', []);
  }

  getAllProjects(): Promise<ProjectModel[]> {
    return new Promise((resolve) => {
      let projectListString = window.localStorage.getItem('kc-projects');
      let projectIdList: string[] = [];
      let projectList: ProjectModel[] = [];
      if (projectListString) {
        projectIdList = JSON.parse(projectListString);
      } else {
        console.error('Could not get project list from kc-projects');
        resolve([]);
      }
      for (let id of projectIdList) {
        let projectString = window.localStorage.getItem(id);
        let project: ProjectModel;
        if (projectString) {
          project = JSON.parse(projectString);
          projectList.push(project);
        }
      }
      resolve(projectList);
    });
  }

  newProject(project: ProjectCreationRequest): any {
    console.log('Creating new project from request: ', project);

    let uuid: UuidModel[] = this.uuidService.generate(1);

    let projectId: UuidModel = uuid[0];

    let newProject = new ProjectModel(project.name, projectId, project.type, project.parentId);
    newProject.topics = project.topics;
    newProject.knowledgeSource = project.knowledgeSource;
    newProject.authors = project.authors;

    let subProjects: ProjectModel[] = [];

    if (project.subProjects) {
      uuid = this.uuidService.generate(project.subProjects.length);

      for (let i = 0; i < project.subProjects.length; i++) {
        let subRequest = project.subProjects[i];

        let newSubProject = new ProjectModel(subRequest.name, uuid[i], subRequest.type, projectId);
        newSubProject.topics = subRequest.topics;
        newSubProject.knowledgeSource = subRequest.knowledgeSource;
        newSubProject.authors = subRequest.authors;

        subProjects.push(newSubProject);
      }
    }

    console.log('Creating new project: ', newProject);

    this.projectSource.push(newProject);
    this.storageService.saveProject(newProject);

    for (let subProject of subProjects) {
      this.projectSource.push(subProject);
      this.storageService.saveProject(subProject);
    }

    this.setCurrentProject(newProject.id.value);
    this.refreshTree();
  }

  updateProject(projectUpdate: ProjectUpdateRequest) {
    // Make sure the target project exists
    let projectToUpdate = this.projectSource.find(p => p.id.value === projectUpdate.id.value);
    if (!projectToUpdate) {
      console.error('Project not found: ', projectUpdate.id);
      return;
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
        let removeTopics: TopicModel[] = projectUpdate.removeTopic;
        for (let topic of removeTopics) {
          projectToUpdate.topics = projectToUpdate.topics.filter(t => t.id.value !== topic.id.value);
        }
      }
    }

    // Persist project to storage system
    let projectString = JSON.stringify(projectToUpdate);
    window.localStorage.setItem(projectUpdate.id.value, projectString);

    // Update project source
    this.projectSource = this.projectSource.filter(p => p.id.value !== projectUpdate.id.value);
    this.projectSource.push(projectToUpdate);
    this.setCurrentProject(projectUpdate.id.value);
  }

  setCurrentProject(id: string): void {
    if (id && id !== '') {
      for (let project of this.projectSource) {
        if (project.id.value && project.id.value === id) {
          this.selectedSource.next(project);
          window.localStorage.setItem('current-project', id);
        }
      }
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

  deleteProject(id: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // First remove all (direct) children
      // TODO: this is extremely naive and will result in issues. We must recursively delete all subprojects
      for (let project of this.projectSource) {
        if (project.parentId?.value === id) {
          this.projectSource = this.projectSource.filter(item => item.id.value !== project.id.value);
        }
      }
      console.log('Filtering projects (deleting) ', id);
      this.projectSource = this.projectSource.filter(item => item.id.value !== id);
      console.log('Saving project list: ', this.projectSource);
      this.storageService.saveProjectList(this.projectSource);
      console.log('Refreshing tree...');
      this.refreshTree();
    });
  }

  private addKnowledgeSource(project: ProjectModel, add: KnowledgeSourceModel[]): ProjectModel {
    // TODO: eventually make sure there are no duplicates...
    if (project.knowledgeSource && project.knowledgeSource.length > 0)
      project.knowledgeSource = [...project.knowledgeSource, ...add];
    else
      project.knowledgeSource = add;

    return project;
  }

  private removeKnowledgeSource(project: ProjectModel, remove: KnowledgeSourceModel[]): ProjectModel {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      let ksList: KnowledgeSourceModel[] = project.knowledgeSource;
      for (let toRemove of remove) {
        ksList = ksList.filter(p => p.id.value !== toRemove.id.value);
      }
      project.knowledgeSource = ksList;
    } else {
      console.error(`Attempting to remove ${remove.length} knowledge source(s) from project with no knowledge sources...`);
    }
    return project;
  }

  private updateKnowledgeSource(project: ProjectModel, update: KnowledgeSourceModel[]): ProjectModel {
    console.log('Update: ', update);
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      for (let toUpdate of update) {
        let idx = project.knowledgeSource.findIndex(p => p.id.value === toUpdate.id.value);
        if (idx) {
          project.knowledgeSource[idx] = toUpdate;
        } else {
          console.error('Error attempting to update Knowledge Source with no matching ID...');
        }
      }
    }
    console.log('KS after update: ', project.knowledgeSource);
    return project;
  }

  private updateTopics(project: ProjectModel, topics: string[]) {
    return project;
  }
}
