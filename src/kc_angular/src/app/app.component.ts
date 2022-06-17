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
import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from "./services/ipc-services/settings.service";
import {ConfirmationService, MenuItem, PrimeIcons, TreeNode} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {ProjectService} from "./services/factory-services/project.service";
import {ProjectTreeNode} from "./models/project.tree.model";
import {KcProject, ProjectCreationRequest} from "./models/project.model";
import {Subscription} from "rxjs";
import {KsFactoryService} from "./services/factory-services/ks-factory.service";
import {ElectronIpcService} from "./services/ipc-services/electron-ipc.service";
import {ProjectCreationDialogComponent} from "./components/project-components/project-creation-dialog/project-creation-dialog.component";
import {BrowserViewDialogService} from "./services/ipc-services/browser-view-dialog.service";
import {ThemeService} from "./services/user-services/theme.service";
import {DisplaySettingsComponent} from "./components/settings-components/display-settings/display-settings.component";
import {DialogRequest} from "../../../kc_shared/models/electron.ipc.model";
import {SearchSettingsComponent} from "./components/settings-components/search-settings/search-settings.component";
import {ProjectTreeFactoryService} from "./services/factory-services/project-tree-factory.service";
import {IngestSettingsComponent} from "./components/settings-components/ingest-settings/ingest-settings.component";
import {NotificationsService} from "./services/user-services/notifications.service";
import {UUID} from "./models/uuid";
import {IngestService} from "./services/ingest-services/ingest.service";
import {DragAndDropService} from "./services/ingest-services/drag-and-drop.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('searchBar') searchBar!: ElementRef;

  currentProject: KcProject | null = null;

  menuBarItems: MenuItem[] = [];

  ksIngestVisible: boolean = false;

  projectTreeVisible: boolean = false;

  readyToShow: boolean = false;

  treeNodes: TreeNode[] = [];

  private _projectNodes: ProjectTreeNode[] = [];

  private _subProjectTree: Subscription;

  private _subCurrentProject: Subscription;

  constructor(private settings: SettingsService,
              private notifications: NotificationsService,
              private dialog: DialogService,
              private dnd: DragAndDropService,
              private factory: KsFactoryService,
              private projects: ProjectService,
              private ipc: ElectronIpcService,
              private ingest: IngestService,
              private browserView: BrowserViewDialogService,
              private themes: ThemeService,
              private projectTree: ProjectTreeFactoryService,
              private confirmation: ConfirmationService,) {
    // Subscribe to changes in project tree
    this._subProjectTree = this.projects.projectTree.subscribe((projectNodes: ProjectTreeNode[]) => {
      this._projectNodes = projectNodes;
      this.treeNodes = this.projectTree.constructTreeNodes(projectNodes, false);
    });

    // Subscribe to active project
    this._subCurrentProject = this.projects.currentProject.subscribe(current => {
      this.notifications.debug('App', 'Project Changed', current?.name ?? current?.id.value ?? '');
      this.confirmation.close();
      this.currentProject = current;
    });

    // When the app starts, we want to ensure the theme has been completed loaded
    themes.setLocal().then((_: any) => {
      setTimeout(() => {
        this.readyToShow = true;
      }, Math.floor(Math.random() * 2000));
    });
  }

  get selectedNode() {
    return this.projectTree.findTreeNode(this.treeNodes, this.currentProject?.id.value ?? '') ?? {};
  }

  @HostListener('document:keydown.Control.n')
  @HostListener('document:keydown.meta.n')
  keyPressOpenIngest() {
    this.projectTreeVisible = false;
    this.onOpenIngest();
  }

  @HostListener('document:keydown.Control.p')
  @HostListener('document:keydown.meta.p')
  keyPressOpenProjects() {
    this.ksIngestVisible = false;
    this.projectTreeVisible = !this.projectTreeVisible;
  }

  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    // Drop listener for importing files and links
    this.dnd.parseDragEvent(event).then((ksReq) => {
      if (ksReq) {
        this.factory.many(ksReq).then((ksList) => {
          this.ingest.enqueue(ksList);
        })
      }
    })
    this.ksIngestVisible = true;
  }

  ngOnInit() {
    this.configureToolbar();
  }

  ngOnDestroy() {
    this._subCurrentProject.unsubscribe();
    this._subProjectTree.unsubscribe();
  }

  configureToolbar() {
    this.menuBarItems = [
      {
        label: 'Projects', icon: PrimeIcons.LIST, command: () => {
          this.projectTreeVisible = !this.projectTreeVisible;
        }
      },
      {
        label: 'Settings', icon: 'pi pi-fw pi-cog', items: [
          {
            label: 'Display', icon: 'pi pi-fw pi-image', command: () => {
              this.dialog.open(DisplaySettingsComponent, {
                header: 'Display Settings',
                width: '64rem',
                dismissableMask: true,
                modal: true
              });
            }
          },
          {
            label: 'Up Next', icon: 'pi pi-fw pi-arrow-circle-down', command: () => {
              this.dialog.open(IngestSettingsComponent, {
                header: 'Up Next Settings',
                width: '64rem',
                dismissableMask: true,
                modal: true
              });
            }
          },
          {
            label: 'Search', icon: 'pi pi-fw pi-search', command: () => {
              this.dialog.open(SearchSettingsComponent, {
                data: this.settings.get().search,
                header: 'Search Settings',
                width: '64rem',
                dismissableMask: true,
                modal: true
              });
            }
          },
        ]
      }
    ];
  }

  onKcClick() {
    let req: KcDialogRequest = {
      ksList: [this.currentProject?.knowledgeSource]
    }
    this.ipc.openKcDialog(req).catch((reason) => {
      this.notifications.error('Knowledge Canvas', 'Error Opening Graph', `Something prevented Knowledge Canvas from opening graph view.`);
    });
  }

  createProject(parentId?: UUID) {
    const dialogref = this.dialog.open(ProjectCreationDialogComponent, {
      width: '90%',
      modal: true,
      data: {parentId: parentId ?? undefined}
    });

    dialogref.onClose.subscribe((creationRequest: ProjectCreationRequest) => {
      if (creationRequest) {
        this.projects.newProject(creationRequest).catch((reason) => {
          this.notifications.error('App', 'Unable to Create Project', reason);
        }).then((_) => {
          this.notifications.success('App', 'Project Created', creationRequest.name);
        });
      }
    });
  }

  searchTopic(topic: string) {
    let ks = this.factory.searchKS(topic);
    this.browserView.open({ks: ks});
  }

  search(term: string) {
    this.searchTopic(term);
    if (this.searchBar)
      this.searchBar.nativeElement.value = ''
  }

  deleteProject(id: UUID) {
    let project = this.projects.getProject(id);
    let subprojects = this.projects.getSubTree(id)
    this.confirmation.confirm({
      message: `Are you sure you want to remove ${subprojects.length} Projects?`,
      accept: () => {
        let details: string = subprojects.map((p) => p.title).join(', ');
        this.notifications.warn('App', 'Project(s) Deleted', details);
        this.projects.deleteProject(id)
      }
    })
  }

  onOpenIngest(_?: any) {
    this.ksIngestVisible = !this.ksIngestVisible;
  }
}
