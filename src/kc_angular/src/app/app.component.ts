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


import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from "./services/ipc-services/settings-service/settings.service";
import {ConfirmationService, MenuItem, PrimeIcons, PrimeNGConfig, TreeNode} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {ProjectService} from "./services/factory-services/project-service/project.service";
import {KsQueueService} from "./services/command-services/ks-queue-service/ks-queue.service";
import {KnowledgeSource} from "./models/knowledge.source.model";
import {OverlayPanel} from "primeng/overlaypanel";
import {ProjectTreeNode} from "./models/project.tree.model";
import {ProjectModel, ProjectUpdateRequest} from "./models/project.model";
import {Subscription} from "rxjs";
import {UuidModel} from "./models/uuid.model";
import {KnowledgeSourceFactoryRequest, KsFactoryService} from "./services/factory-services/ks-factory-service/ks-factory.service";
import {Dialog} from "primeng/dialog";
import {KsCommandService} from "./services/command-services/ks-command/ks-command.service";
import {KsImportConfirmComponent} from "./components/knowledge-source-components/ks-import-confirm/ks-import-confirm.component";
import {Clipboard} from "@angular/cdk/clipboard";
import {ElectronIpcService} from "./services/ipc-services/electron-ipc/electron-ipc.service";
import {ProjectCreationDialogComponent} from "./components/project-components/project-creation-dialog/project-creation-dialog.component";
import {BrowserViewDialogService} from "./services/ipc-services/browser-service/browser-view-dialog.service";
import {ThemeService} from "./services/user-services/theme-service/theme.service";
import {DisplaySettingsComponent} from "./components/settings-components/display-settings/display-settings.component";
import {KsIngestComponent} from "./components/knowledge-source-components/ks-ingest/ks-ingest.component";
import {IngestSettingsComponent} from "./components/settings-components/ingest-settings/ingest-settings.component";
import {KcDialogRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {SearchSettingsComponent} from "./components/settings-components/search-settings/search-settings.component";
import {ProjectTreeFactoryService} from "./services/factory-services/project-tree-factory/project-tree-factory.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('ksUpNext') ksQueueDialog!: Dialog;
  @ViewChild('ksQueueOverlay') ksQueueOverlay!: OverlayPanel;
  @ViewChild('searchBar') searchBar!: ElementRef;
  currentProject: ProjectModel | null = null;
  menuBarItems: MenuItem[] = [];
  ksUpNextVisible: boolean = false;
  showProjectTree: boolean = false;
  readyToShow: boolean = false;
  treeNodes: TreeNode[] = [];
  ksQueueTreeNodes: TreeNode[] = [];
  ksQueue: KnowledgeSource[] = [];
  private _projectNodes: ProjectTreeNode[] = [];
  private _subProjectTree: Subscription;
  private _subCurrentProject: Subscription;
  private _subKsQueue: Subscription;

  constructor(private dialogService: DialogService, private confirmationService: ConfirmationService,
              private primengConfig: PrimeNGConfig, private settingsService: SettingsService,
              private ksQueueService: KsQueueService, private ksFactory: KsFactoryService,
              private projectService: ProjectService, private ksCommandService: KsCommandService,
              private ipcService: ElectronIpcService, private clipboard: Clipboard,
              private browserViewDialogService: BrowserViewDialogService, private themeService: ThemeService,
              private projectTreeFactory: ProjectTreeFactoryService) {
    // Subscribe to changes in project tree
    this._subProjectTree = this.projectService.projectTree.subscribe((projectNodes: ProjectTreeNode[]) => {
      this._projectNodes = projectNodes;
      this.treeNodes = this.projectTreeFactory.constructTreeNodes(projectNodes, false);
      this.ksQueueTreeNodes = this.projectTreeFactory.constructTreeNodes(projectNodes, true);
    });

    // Subscribe to active project
    this._subCurrentProject = this.projectService.currentProject.subscribe(current => {
      console.debug('AppComponent Project Update: ', current);
      this.currentProject = current;
    });

    // Subscribe to changes in Up Next
    this._subKsQueue = this.ksQueueService.ksQueue.subscribe((queue) => {
      console.debug('AppComponent UpNext Update: ', queue);
      this.ksQueue = queue;
    });

    // When the app starts, we want to ensure the theme has been completed loaded
    themeService.setLocal().then((_: any) => {
      setTimeout(() => {
        this.readyToShow = true;
      }, Math.floor(Math.random() * 2000));
    });
  }

  get ksQueueSelectedNode() {
    return this.projectTreeFactory.findTreeNode(this.treeNodes, this.currentProject?.id.value ?? '') ?? {};
  }

  get selectedNode() {
    return this.projectTreeFactory.findTreeNode(this.treeNodes, this.currentProject?.id.value ?? '') ?? {};
  }

  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  // Drop listener for importing files and links
  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    // TODO: replace this with drag and drop handler service

    event.preventDefault();

    if (!event.dataTransfer?.items) {
      return;
    }

    // Try to differentiate different drop types using text data
    let textData = event.dataTransfer.getData('text/plain');
    let htmlData = event.dataTransfer.getData('text/html');
    let uriData = event.dataTransfer.getData('text/uri-list');

    console.log('Types: ', event.dataTransfer.types);
    console.log('Text Data: ', textData);
    console.log('HTML Data: ', htmlData);
    console.log('URL Data: ', uriData);


    // Links/URLs will arrive such that uriData and textData are identical
    if (textData.length && uriData.length && textData === uriData) {
      let ksReq: KnowledgeSourceFactoryRequest = {ingestType: 'website', links: [uriData]}
      this.ksFactory.many(ksReq).then((ks) => {
        if (ks && ks.length) {
          this.onImport(ks);
        }
      })
      return;
    }

    // The Mozilla spec states that HTML content should be presented as both plain text or as html
    if (event.dataTransfer.types.length === 2 && textData.length && htmlData.length) {
      console.log('Give user choice between importing as text or as html...');
      return;
    }


    let files: File[] = [];
    if (event.dataTransfer?.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < event.dataTransfer.items.length; i++) {

        if (event.dataTransfer.items[i].kind === 'file') {
          let file = event.dataTransfer.items[i].getAsFile();
          if (file)
            files.push(file);
        }
      }
    } else if (event.dataTransfer.files) {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(event.dataTransfer.files[i]);
      }
    }

    if (files.length) {
      let ksReq: KnowledgeSourceFactoryRequest = {
        ingestType: 'file',
        files: files
      }

      this.ksFactory.many(ksReq).then((ks) => {
        if (ks && ks.length) {
          this.onImport(ks);
        }
      }).catch((reason) => {
        console.warn(reason);
      })
    }
  }

  onImport(ksList: KnowledgeSource[]) {
    let ref = this.dialogService.open(KsImportConfirmComponent, {
      header: 'Import Knowledge Source',
      dismissableMask: true,
      modal: true,
      width: '420px',
      data: {
        projectName: this.currentProject?.name ?? '',
        countdownSeconds: 5
      }
    });

    ref.onClose.subscribe((result) => {
      if (!result || result === 'queue' || result === '' || !this.currentProject) {
        this.ksQueueService.enqueue(ksList);
      } else {
        if (this.currentProject) {
          for (let ks of ksList) {
            ks.associatedProject = this.currentProject.id;
          }
          let update: ProjectUpdateRequest = {
            id: this.currentProject.id,
            addKnowledgeSource: ksList
          }
          this.projectService.updateProjects([update]);
        }
      }
    });

  }

  ngOnInit() {
    this.primengConfig.ripple = false;
    this.configureToolbar();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this._subCurrentProject.unsubscribe();
    this._subProjectTree.unsubscribe();
    this._subKsQueue.unsubscribe();
  }

  configureToolbar() {
    this.menuBarItems = [
      {
        label: 'Projects', icon: PrimeIcons.LIST, command: () => {
          this.showProjectTree = !this.showProjectTree;
        }
      },
      {
        label: 'Settings', icon: 'pi pi-fw pi-cog', items: [
          {
            label: 'Display', icon: 'pi pi-fw pi-image', command: () => {
              this.dialogService.open(DisplaySettingsComponent, {
                header: 'Display Settings',
                width: '350px',
                dismissableMask: true,
                modal: true
              });
            }
          },
          {
            label: 'Ingest', icon: 'pi pi-fw pi-arrow-circle-down', command: () => {
              this.dialogService.open(IngestSettingsComponent, {
                header: 'Ingest Settings',
                dismissableMask: true,
                modal: true
              });
            }
          },
          {
            label: 'Search', icon: 'pi pi-fw pi-search', command: () => {
              this.dialogService.open(SearchSettingsComponent, {
                data: this.settingsService.getSettings().search
              });
            }
          },
        ]
      },
      {
        label: 'Exit',
        icon: PrimeIcons.POWER_OFF,
        command: ($event) => {
          this.confirmExit($event);
        }
      }
    ];
  }

  clearQueue() {
    this.ksQueueService.clearResults();
  }

  confirmExit(event: any) {
    if (!event.originalEvent.target && !event.target) {
      console.error('Confirmation target does not exist.', event);
      return;
    }

    this.confirmationService.confirm({
      target: event.originalEvent.target ?? event.target,
      message: 'Are you sure that you want to close Knowledge Canvas?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        window.close();
      }
    });
  }

  closeKsQueue() {
    this.ksUpNextVisible = false;
  }

  ksQueueUpdate(mappings: { projectId: string; ksList: KnowledgeSource[] }[]) {
    let updates: ProjectUpdateRequest[] = [];

    for (let map of mappings) {
      if (map.ksList.length > 0) {
        for (let ks of map.ksList) {
          ks.associatedProject = new UuidModel(map.projectId);
        }
        let update: ProjectUpdateRequest = {
          id: new UuidModel(map.projectId),
          addKnowledgeSource: map.ksList
        }
        updates.push(update);
      }
    }
    this.projectService.updateProjects(updates);
  }

  openKsQueue($event?: any) {
    if (this.ksQueue.length)
      this.ksUpNextVisible = true;
    else {
      this.ksQueueOverlay.toggle($event);
    }
  }

  ksQueueRemove(ks: KnowledgeSource) {
    this.ksQueueService.remove(ks);
  }

  onKcClick() {
    let req: KcDialogRequest = {
      ksList: [this.currentProject?.knowledgeSource]
    }
    this.ipcService.openKcDialog(req).then((result) => {
      console.log('Result from knowledge canvas: ', result);
    });

    // let projectId: string | undefined = undefined;
    // if (this.currentProject) {
    //   let ancestors = this.projectService.getAncestors(this.currentProject.id.value);
    //   if (ancestors) {
    //     console.log('Ancestors: ', ancestors);
    //     projectId = ancestors[0].id
    //   }
    // }
    //
    // let kGraphConfig: KnowledgeGraphConfig = {
    //   type: 'project-hierarchy',
    //   projectTree: this._projectNodes,
    //   projectId: projectId
    // }
    //
    // this.projectService.getAllProjects().then((projects) => {
    //   this.dialogService.open(KnowledgeGraphComponent, {
    //     height: '100vh', width: '100vw', closable: true, data: kGraphConfig
    //   });
    // })
  }

  createProject(parentId?: UuidModel) {
    const dialogref = this.dialogService.open(ProjectCreationDialogComponent, {
      width: '90%',
      modal: true,
      data: {parentId: parentId ?? undefined}
    });

    dialogref.onClose.subscribe((creationRequest) => {
      if (creationRequest) {
        console.debug('AppComponent: submitting project creation request ', creationRequest);
        this.projectService.newProject(creationRequest);
      }
    });
  }

  searchTopic(topic: string) {
    let ks = this.ksFactory.searchKS(topic);
    this.browserViewDialogService.open({ks: ks});
  }

  search(term: string) {
    this.searchTopic(term);
    if (this.searchBar)
      this.searchBar.nativeElement.value = ''
  }

  deleteProject(id: UuidModel) {
    let project = this.projectService.getProject(id);
    let subprojects = this.projectService.getSubTree(id)
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${subprojects.length} Projects?`,
      accept: () => {
        console.debug('AppComponent: Deleting project(s): ', project, subprojects);
        this.projectService.deleteProject(id)
      }
    })
  }

  onSpeedDialClick($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dialogService.open(KsIngestComponent, {
      width: '95%'
    });
  }
}
