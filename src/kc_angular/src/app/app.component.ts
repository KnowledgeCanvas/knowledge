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
import {Component, HostListener, OnInit} from '@angular/core';
import {environment} from "../environments/environment";
import {SettingsService} from "./services/ipc-services/settings.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "./services/factory-services/project.service";
import {KsFactoryService} from "./services/factory-services/ks-factory.service";
import {ElectronIpcService} from "./services/ipc-services/electron-ipc.service";
import {ThemeService} from "./services/user-services/theme.service";
import {DialogRequest} from "../../../kc_shared/models/electron.ipc.model";
import {NotificationsService} from "./services/user-services/notifications.service";
import {IngestService} from "./services/ingest-services/ingest.service";
import {DragAndDropService} from "./services/ingest-services/drag-and-drop.service";
import {KsCommandService} from "./services/command-services/ks-command.service";
import {ProjectTreeFactoryService} from "./services/factory-services/project-tree-factory.service";
import {NavigationEnd, Router} from "@angular/router";
import {KsDetailsComponent} from "./components/source-components/ks-details.component";
import {map, take} from "rxjs/operators";
import {StartupService} from "./services/ipc-services/startup.service";


type SidebarItem = {
  label: string,
  routerLink?: any,
  command?: any,
  icon: string
}

@Component({
  selector: 'app-root',
  template: `
    <div id="app-header" class="w-full p-fluid title-bar flex-row-center-between pl-2 surface-ground border-bottom-1 surface-border" style="height: 32px; max-width: 100vw">
      <div class="select-none title-bar-interactive flex-row-center-start" *ngIf="os && os === 'darwin'">
        <div (click)="close($event)" class="macos-window-button window-button-close"></div>
        <div (click)="minimize($event)" class="macos-window-button window-button-minimize"></div>
        <div (click)="maximize($event)" class="macos-window-button window-button-maximize"></div>
      </div>
      <div *ngIf="!os || (os && os !== 'darwin')"></div>

      <div class="title-bar-interactive flex-row-center-between">
        <app-history class="pr-8"></app-history>
        <app-search></app-search>
      </div>

      <div *ngIf="!os || (os && os === 'darwin')"></div>
      <div class="select-none title-bar-interactive flex flex-row align-items-start h-full" *ngIf="os && os !== 'darwin'">
        <div (click)="minimize($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi">???</div>
        </div>
        <div (click)="maximize($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi pi-stop"></div>
        </div>
        <div (click)="close($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi pi-times"></div>
        </div>
      </div>
    </div>

    <div *ngIf="!readyToShow" class="w-full h-full surface-a flex-col-center-center">
      <p-image src="assets/img/kc-logo-transparent.svg" class="w-5"></p-image>
      <p-progressBar mode="indeterminate" class="w-3"></p-progressBar>
      Getting things ready...
    </div>

    <div [hidden]="!readyToShow" class="flex relative lg:static" style="height: calc(100vh - 32px); max-width: 100vw">
      <div id="app-sidebar" class="h-full md:h-auto md:block flex-shrink-0 absolute md:static left-0 top-0 z-1 border-right-1 surface-0 border-primary w-auto">
        <div class="flex h-full">
          <div class="flex flex-column h-full flex-shrink-0">
            <div class="flex align-items-center justify-content-center select-none flex-shrink-0" style="height: 60px; width: 60px" (dragstart)="$event.preventDefault()">
              <img src="assets/img/kc-icon-transparent.png" height="30" alt="Knowledge Logo" (click)="onKcClick()" class="cursor-pointer">
            </div>
            <div class="overflow-y-auto mt-3">
              <ul class="list-none py-3 pl-2 pr-0 m-0">
                <li *ngFor="let item of sidebarItems" class="mb-2" [pTooltip]="item.label" (click)="onSidebarClick($event, item)" (dragstart)="$event.preventDefault()">
                  <a [routerLink]="item.routerLink"
                     class="p-element flex align-items-center cursor-pointer py-3 pl-0 pr-2 justify-content-center hover:surface-200 text-700 hover:text-900 transition-duration-150 transition-colors no-underline"
                     [class.bg-primary]="item.label === selectedView"
                     [class.hover:bg-primary]="item.label === selectedView"
                     style="border-top-left-radius: 30px; border-bottom-left-radius: 30px;">
                    <i *ngIf="item.label === 'Inbox' && inboxBadge > 0" class="{{item.icon}} text-xl no-underline" pBadge value="{{inboxBadge}}" severity="danger"></i>
                    <i *ngIf="item.label === 'Inbox' && inboxBadge === 0" class="{{item.icon}} text-xl no-underline"></i>
                    <i *ngIf="item.label !== 'Inbox'" class="{{item.icon}} text-xl no-underline"></i>
                    <span class="p-ink" style="height: 64px; width: 64px; top: 5px; left: 5px;"></span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="mt-auto">
              <a class="p-element m-3 flex align-items-center cursor-pointer p-2 justify-content-center border-round bg-primary text-0 transition-duration-150 transition-colors"
                 (click)="showSettings()">
                <i class="pi pi-cog text-xl"></i>
                <span class="p-ink" style="height: 64px; width: 64px; top: 4px; left: -1px;"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="app-body" class="w-full flex flex-column relative flex-auto select-none" style="max-height: calc(100vh - 32px)">
        <div id="app-router-outlet" class="flex-auto overflow-y-auto" style="max-height: calc(100vh - 80px); max-width: calc(100vw - 61px)">
          <router-outlet></router-outlet>
        </div>
        <div id="app-footer">
          <app-project-breadcrumb (dragstart)="$event.preventDefault()"
                                  class="w-full h-full select-none"
                                  [projectId]="projectId"
                                  (onShowProjectTree)="projectTreeVisible = $event">
          </app-project-breadcrumb>
        </div>
      </div>
    </div>

    <p-sidebar [(visible)]="projectTreeVisible"
               [style]="{height: '100%', width: '30em'}"
               appendTo="body"
               [modal]="true"
               [dismissible]="true">
      <app-projects-tree *ngIf="projectTreeVisible"></app-projects-tree>
    </p-sidebar>

    <p-confirmDialog appendTo="body"></p-confirmDialog>
    <p-messages key="app-banner"></p-messages>
    <p-toast key="app-toast"></p-toast>
  `,
  styles: [
    `
      ::ng-deep {
        .p-submenu-list {
          z-index: 99 !important;
        }

        .p-sidebar-content {
          height: 100%;
        }
      }

      .title-bar {
        -webkit-user-select: none;
        -webkit-app-region: drag;
      }

      .title-bar-interactive {
        -webkit-app-region: no-drag;
      }

      .macos-window-button {
        height: 1rem;
        width: 1rem;
        margin-right: 0.6rem;
        border-radius: 50%;
      }

      .window-button {
        height: 32px;
        width: 45px;
      }

      .window-button-close {
        margin-left: 2px;
        background-color: #FF5F57;
      }

      .window-button-maximize {
        background-color: #2BC840;
      }

      .window-button-minimize {
        background-color: #FFBC2E;
      }

      #app-footer {
        height: 4rem;
      }
    `
  ]
})
export class AppComponent implements OnInit {
  projectId: string = '';

  projectTreeVisible: boolean = false;

  readyToShow: boolean = false;

  inboxBadge: number = 0;

  sourceInfoDialog?: DynamicDialogRef;

  sidebarItems: SidebarItem[] = [
    {label: 'Inbox', routerLink: ['app', 'inbox', 'undefined'], icon: 'pi pi-inbox'},
  ];

  selectedView: string = this.sidebarItems[0].label;

  os: string = '';

  constructor(private settings: SettingsService,
              private notifications: NotificationsService,
              private startup: StartupService,
              private command: KsCommandService,
              private dialog: DialogService,
              private dnd: DragAndDropService,
              private factory: KsFactoryService,
              private projects: ProjectService,
              private ipc: ElectronIpcService,
              private ingest: IngestService,
              private tree: ProjectTreeFactoryService,
              private router: Router,
              private themes: ThemeService,) {
    // Acquire system settings, set window controls based on OS
    settings.all.pipe(take(2), map(s => s.system)).subscribe((systemSettings) => {
      if (systemSettings && systemSettings.osPlatform) {
        this.os = systemSettings.osPlatform;
      }
    });

    // Acquire user settings, start tutorial if necessary
    settings.all.pipe(take(2), map(s => s.user)).subscribe((userSettings) => {
      if (!userSettings) {
        return;
      }

      if (userSettings.tutorials === undefined) {
        settings.set({user: {tutorials: {showFirstRunTutorial: true}}});
      } else if (userSettings.tutorials.showFirstRunTutorial) {
        setTimeout(() => {
          this.startup.tutorial().subscribe(showAgain => {
            settings.set({user: {tutorials: {showFirstRunTutorial: showAgain}}});
          })
        }, 1000)
      }
    })

    /**
     * Subscribe to router events in order to manually adjust the current view
     */
    router.events.subscribe((events) => {
      if (events instanceof NavigationEnd) {
        const segments = events.url.split('/').filter(f => f.length);
        const visibleRoute = segments[1];
        switch (visibleRoute) {
          case 'inbox':
          case '(inbox':
            this.selectedView = 'Inbox'
            break;
          case 'projects':
          case '(projects':
            this.selectedView = 'Projects'
            break;
          case 'table':
          case '(table':
            this.selectedView = 'Table'
            break;
          case 'grid':
          case '(grid':
            this.selectedView = 'Grid'
            break;
          case 'calendar':
          case '(calendar':
            this.selectedView = 'Calendar'
            break;
          default:
            break;
        }
      }
    });

    this.command.ksDetailEvent.subscribe((ks) => {
      if (ks?.force && this.sourceInfoDialog) {
        this.sourceInfoDialog.close();
      }

      if (ks && !this.sourceInfoDialog) {
        this.sourceInfoDialog = this.dialog.open(KsDetailsComponent, {
          data: {ks: ks},
          width: 'min(90vw, 128rem)',
          height: 'min(90vh, 128rem)',
          showHeader: false,
          contentStyle: {'border-radius': '10px'},
          closeOnEscape: true
        });

        this.sourceInfoDialog.onClose.subscribe(() => {
          this.sourceInfoDialog = undefined;
        })
      }
    });

    ingest.queue.subscribe((upNext) => {
      this.inboxBadge = upNext.length;
    })

    projects.currentProject.subscribe((project) => {
      if (project) {
        this.projectId = project.id.value;
        this.sidebarItems = [
          {label: 'Inbox', routerLink: ['app', 'inbox', this.projectId], icon: 'pi pi-inbox'},
          {label: 'Projects', routerLink: ['app', 'projects', this.projectId], icon: 'pi pi-list'},
          {label: 'Table', routerLink: ['app', 'table', this.projectId], icon: 'pi pi-table'},
          {label: 'Grid', routerLink: ['app', 'grid', this.projectId], icon: 'pi pi-th-large'},
          {label: 'Calendar', routerLink: ['app', 'calendar', this.projectId], icon: 'pi pi-calendar'},
        ];
      } else {
        this.projectId = '';
      }
    });

    // When the app starts, we want to ensure the theme has been completely loaded
    themes.setLocal().then((_: any) => {
      setTimeout(() => {
        this.readyToShow = true;
      }, Math.floor(Math.random() * 1000));
    });
  }

  /* TODO: Create a hotkey service that registers these keys on behalf of each module */
  @HostListener('document:keydown.Control.r', ["$event"])
  @HostListener('document:keydown.f5', ["$event"])
  @HostListener('document:keydown.meta.r', ["$event"])
  refresh(event: KeyboardEvent) {
    if (!event) {
      this.notifications.warn('App', 'Invalid Keystroke', 'Refresh');
      return;
    }

    try {
      event.preventDefault();
    } catch (e) {
      this.notifications.error('App', 'Unexpected Event', 'Host Listener provided an invalid event for refresh command.');
    }

    if (!environment.production) {
      location.reload();
    }
  }

  @HostListener('document:keydown.Control.p')
  @HostListener('document:keydown.meta.p')
  keyPressOpenProjects() {
    this.projectTreeVisible = !this.projectTreeVisible;
  }

  @HostListener('document:keydown.Control.1')
  @HostListener('document:keydown.meta.1')
  goInbox() {
    this.router.navigate(['app', 'inbox', this.projectId]);
  }

  @HostListener('document:keydown.Control.2')
  @HostListener('document:keydown.meta.2')
  goProjects() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'projects', this.projectId]);
    }
  }

  @HostListener('document:keydown.Control.3')
  @HostListener('document:keydown.meta.3')
  goTable() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'table', this.projectId]);
    }
  }

  @HostListener('document:keydown.Control.4')
  @HostListener('document:keydown.meta.4')
  goGrid() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'grid', this.projectId]);
    }
  }

  @HostListener('document:keydown.Control.5')
  @HostListener('document:keydown.meta.5')
  goCalendar() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'calendar', this.projectId]);
    }
  }

  @HostListener('document:keydown.Control.,')
  @HostListener('document:keydown.meta.,')
  goSettings() {
    this.showSettings();
  }

  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    // Drop listener for importing files and links
    this.dnd.parseDragEvent(event).then((ksReq) => {
      if (ksReq) {
        this.factory.many(ksReq).then((ksList) => {
          if (ksList.length > 0) {
            this.ingest.enqueue(ksList);
          }
        })
      }
    })
  }

  ngOnInit() {
  }

  showSettings() {
    this.settings.show();
  }

  onKcClick() {
    let req: DialogRequest = {
      ksList: []
    }
    this.ipc.openKcDialog(req).catch((_) => {
      this.notifications.error('App', 'Error Opening Graph', `Something prevented Knowledge from opening graph view.`);
    });
  }

  close(_: MouseEvent) {
    window.close()
  }

  minimize(_: MouseEvent) {
    window.api.send('A2E:Window:Minimize');
  }

  maximize(_: MouseEvent) {
    window.api.send('A2E:Window:Maximize');
  }

  onSidebarClick($event: MouseEvent, item: SidebarItem) {
    this.selectedView = item.label === 'Settings' ? this.selectedView : item.label;
    if (item.command) {
      item.command();
    }
  }
}
