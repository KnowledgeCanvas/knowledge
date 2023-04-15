/*
 * Copyright (c) 2022-2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {environment} from "../environments/environment";
import {SettingsService} from "./services/ipc-services/settings.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "./services/factory-services/project.service";
import {KsFactoryService} from "./services/factory-services/ks-factory.service";
import {ElectronIpcService} from "./services/ipc-services/electron-ipc.service";
import {ThemeService} from "./services/user-services/theme.service";
import {NotificationsService} from "./services/user-services/notifications.service";
import {IngestService} from "./services/ingest-services/ingest.service";
import {DragAndDropService} from "./services/ingest-services/drag-and-drop.service";
import {KsCommandService} from "./services/command-services/ks-command.service";
import {ProjectTreeFactoryService} from "./services/factory-services/project-tree-factory.service";
import {ChildrenOutletContexts, NavigationEnd, Router} from "@angular/router";
import {KsDetailsComponent} from "./components/source-components/ks-details.component";
import {map, take, takeUntil, tap} from "rxjs/operators";
import {BehaviorSubject, Subject, throttleTime} from "rxjs";
import {StartupService} from "./services/ipc-services/startup.service";
import {ProjectCommandService} from "./services/command-services/project-command.service";
import {ProjectDetailsComponent} from "./components/project-components/project-details.component";
import {fadeIn, fadeInAndOut, flyInOut} from "./animations";


type SidebarItem = {
  label: string,
  routerLink?: any,
  command?: any,
  icon: string
}

@Component({
  selector: 'app-root',
  template: `
    <div @fadeIn id="app-header" class="w-full p-fluid title-bar flex-row-center-between pl-2 surface-ground border-bottom-1 surface-border" style="height: 32px; max-width: 100vw">
      <div class="select-none title-bar-interactive flex-row-center-start" *ngIf="os && os === 'darwin'">
        <div (click)="close($event)" class="macos-window-button window-button-close"></div>
        <div (click)="minimize($event)" class="macos-window-button window-button-minimize"></div>
        <div (click)="maximize($event)" class="macos-window-button window-button-maximize"></div>
      </div>
      <div *ngIf="!os || (os && os !== 'darwin')"></div>

      <div class="flex-row-center-between">
        <app-create class="title-bar-interactive"></app-create>
        <app-search class="title-bar-interactive mx-8"></app-search>
        <app-history class="title-bar-interactive"></app-history>
      </div>

      <div *ngIf="!os || (os && os === 'darwin')"></div>
      <div class="select-none title-bar-interactive flex flex-row align-items-start h-full" *ngIf="os && os !== 'darwin'">
        <div (click)="minimize($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi">—</div>
        </div>
        <div (click)="maximize($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi pi-stop"></div>
        </div>
        <div (click)="close($event)" class="window-button hover:surface-300 flex-col-center-center">
          <div class="pi pi-times"></div>
        </div>
      </div>
    </div>

    <div @fadeIn *ngIf="!readyToShow" class="w-full h-full surface-a flex-col-center-center gap-4" style="max-height: calc(100vh - 32px)">
      <div>
        <img src="assets/img/kc-icon-greyscale.png"
             alt="Knowledge Logo"
             class="pulsate-fwd knowledge-logo">
      </div>
      <div style="width: 100%; max-width: 12rem;">
        <p-progressBar mode="indeterminate" class="w-full" [style]="{'height': '0.5rem'}"></p-progressBar>
        Getting things ready...
      </div>
    </div>

    <div *ngIf="readyToShow" class="flex relative lg:static" style="height: calc(100vh - 32px); max-width: 100vw">
      <div id="app-sidebar" class="h-full md:h-auto md:block flex-shrink-0 absolute md:static left-0 top-0 z-1 border-right-1 surface-0 border-primary w-auto">
        <div class="flex h-full">
          <div class="flex flex-column h-full flex-shrink-0">
            <div class="flex align-items-center justify-content-center select-none flex-shrink-0" style="height: 60px; width: 60px" (dragstart)="$event.preventDefault()">
              <img src="assets/img/kc-icon-transparent.png" height="30" alt="Icon for the Knowledge application.">
            </div>
            <div class="overflow-y-auto mt-3">
              <ul class="list-none py-3 pl-2 pr-0 m-0">
                <li *ngFor="let item of sidebarItems" class="mb-2" [pTooltip]="item.label" [routerLink]="item.routerLink" (click)="onSidebarClick($event, item)"
                    (dragstart)="$event.preventDefault()">
                  <a
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
        <div id="app-router-outlet" class="h-full flex flex-row overflow-y-auto" style="max-height: calc(100vh - 80px); max-width: calc(100vw - 61px)">
          <div class="flex flex-column flex-grow-0 h-full">
            <app-projects-tree class="border-right-1 border-primary-500" [@flyInOut]="animate" *ngIf="projectTreeVisible"></app-projects-tree>
          </div>
          <div [@routeAnimations]="routeAnimationData" class="flex-column flex-grow-1 h-full">
            <router-outlet></router-outlet>
          </div>
        </div>
        <div @fadeIn id="app-footer">
          <app-project-breadcrumb (dragstart)="$event.preventDefault()"
                                  class="w-full h-full select-none"
                                  [projectId]="projectId"
                                  (onShowProjectTree)="projectTreeVisible = !projectTreeVisible">
          </app-project-breadcrumb>
        </div>
      </div>
    </div>

    <p-confirmDialog appendTo="body"></p-confirmDialog>
    <p-messages key="app-banner"></p-messages>
    <p-toast [preventOpenDuplicates]="true" position="bottom-right" key="app-toast"></p-toast>
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

      .knowledge-logo {
        height: 8rem;
        filter: drop-shadow(0 0 1px var(--primary-color));
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

      .macos-window-button:hover {
        box-shadow: inset 0 0 3px 0 black;
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
  ],
  animations: [fadeInAndOut, flyInOut, fadeIn]
})
export class AppComponent implements OnInit, OnDestroy {
  /**
   * The current project id
   */
  projectId: string = '';

  /**
   * Whether the project tree is visible
   */
  projectTreeVisible: boolean = true;

  /**
   * Whether the app is ready to show the main view
   */
  readyToShow: boolean = false;

  /**
   * The number of items in the inbox (used for the badge)
   */
  inboxBadge: number = 0;

  /**
   * The reference to the source info dialog
   */
  sourceInfoDialog?: DynamicDialogRef;

  /**
   * The reference to the project info dialog
   */
  projectInfoDialog?: DynamicDialogRef;

  /**
   * A list of sidebar items to display, and their associated router links
   */
  sidebarItems: SidebarItem[] = [
    {label: 'Inbox', routerLink: ['app', 'inbox', 'undefined'], icon: 'pi pi-inbox'},
  ];

  /**
   * The currently selected view
   */
  selectedView: string = this.sidebarItems[0].label;

  /**
   * The host OS (windows, macos, linux)
   */
  os: string = '';

  /**
   * The route animation data, used to determine which animation to use when navigating between views
   */
  routeAnimationData: string = 'Inbox';

  /**
   * Whether to use animations in the app or not
   */
  animate: boolean = true;

  /**
   * The subject used to clean up subscriptions
   * @private
   */
  private cleanUp = new Subject();

  /**
   * The subject used to emit window resize events
   * @private
   */
  private _windowResize = new BehaviorSubject({});


  /**
   * The application component constructor - injects all the services and sets up the subscriptions
   */
  constructor(private settings: SettingsService,
              private notifications: NotificationsService,
              private startup: StartupService,
              private command: KsCommandService,
              private pCommand: ProjectCommandService,
              private dialog: DialogService,
              private dnd: DragAndDropService,
              private factory: KsFactoryService,
              private projects: ProjectService,
              private ipc: ElectronIpcService,
              private ingest: IngestService,
              private tree: ProjectTreeFactoryService,
              private router: Router,
              private contexts: ChildrenOutletContexts,
              private themes: ThemeService,) {
    /**
     * Wait for system settings to be loaded, then check if the OS is Windows or not
     * If it is Windows, then set the OS to 'windows' so that the correct icons are shown
     */
    settings.all.pipe(
      take(2),
      map(s => s.system),
      tap((systemSettings) => {
        if (systemSettings && systemSettings.osPlatform) {
          this.os = systemSettings.osPlatform;
        }
      })
    ).subscribe();

    /**
     * Wait for user settings to be loaded, then check if the first run tutorial should be shown
     */
    settings.all.pipe(
      take(2),
      map(s => s.user),
      tap((userSettings) => {
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
    ).subscribe()

    /**
     * Listen for animation settings changes and update state accordingly
     */
    settings.display.pipe(
      takeUntil(this.cleanUp),
      map(d => d.animations),
      tap((animations) => {
        this.animate = animations;
      })
    ).subscribe()

    /**
     * Listen for route changes and update the sidebar accordingly
     */
    router.events.pipe(
      takeUntil(this.cleanUp),
      tap((events) => {
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
            case 'graph':
            case '(graph':
              this.selectedView = 'Graph'
              break;
            case 'calendar':
            case '(calendar':
              this.selectedView = 'Calendar'
              break;
            default:
              break;
          }

          if (this.animate) {
            this.routeAnimationData = this.selectedView;
          }
        }
      })
    ).subscribe();

    /**
     * Listen for Source Info Dialog events, open/close the dialog as necessary
     */
    this.command.ksDetailEvent.pipe(
      takeUntil(this.cleanUp),
      tap((ks) => {
        if (ks?.force && this.sourceInfoDialog) {
          this.sourceInfoDialog.close();
        }

        if (ks && !this.sourceInfoDialog) {
          this.sourceInfoDialog = this.dialog.open(KsDetailsComponent, {
            data: {ks: ks},
            width: '100vw !important',
            height: '100vh !important',
            styleClass: 'min-h-screen',
            maximizable: true,
            showHeader: false,
            closeOnEscape: true
          });

          setTimeout(() => {
            if (this.sourceInfoDialog) {
              this.sourceInfoDialog.maximize({});
            }
          })

          this.sourceInfoDialog.onClose.pipe(tap(() => {
            this.sourceInfoDialog = undefined;
          })).subscribe();
        }
      })
    ).subscribe();

    /**
     * Listen for Project Info Dialog events, open/close the dialog as necessary
     */
    pCommand.detailEvent.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        if (!project) {
          return;
        }
        this.projectInfoDialog = this.dialog.open(ProjectDetailsComponent, {
          data: {project: project},
          width: 'min(90vw, 128rem)',
          height: 'min(90vh, 128rem)',
          showHeader: false,
          contentStyle: {'border-radius': '10px'},
          closeOnEscape: true
        });

        this.projectInfoDialog.onClose.pipe(tap(() => {
          this.projectInfoDialog = undefined;
        })).subscribe();
      })
    ).subscribe()

    /**
     * Use the ingest queue to update the inbox badge on the sidebar
     */
    ingest.queue.pipe(
      tap((upNext) => {
        this.inboxBadge = upNext.length;
      })
    ).subscribe()

    /**
     * When the project changes, update the sidebar and the project id
     */
    projects.currentProject.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        this.projectId = project?.id.value ?? '';
        this.setSidebar();
      })
    ).subscribe();

    /**
     * When the app starts, we want to ensure the theme has been completely loaded
     */
    themes.setLocal().then((_: any) => {
      setTimeout(() => {
        this.readyToShow = true;
      }, Math.floor(Math.random() * 1500));
    });

    /**
     * Listen for window resize events and update the sidebar visibility accordingly
     */
    this._windowResize.asObservable().pipe(
      takeUntil(this.cleanUp),
      throttleTime(50),
      tap((_) => {
        this.projectTreeVisible = window.innerWidth >= 1200;
      })
    ).subscribe()
  }

  ngOnInit() {
  }

  /**
   * When the component is destroyed, unsubscribe from all observables
   */
  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  /**
   * Sets the sidebar icons and router links.
   * If there are no projects, only display inbox.
   * All other routes require a project ID to display properly.
   */
  setSidebar() {
    this.sidebarItems = (this.projectId && this.projectId.trim().length === 36) ? [
      {label: 'Inbox', routerLink: ['app', 'inbox', this.projectId], icon: 'pi pi-inbox'},
      {label: 'Projects', routerLink: ['app', 'projects', this.projectId], icon: 'pi pi-list'},
      {label: 'Graph', routerLink: ['app', 'graph', this.projectId], icon: 'pi pi-sitemap'},
      {label: 'Table', routerLink: ['app', 'table', this.projectId], icon: 'pi pi-table'},
      {label: 'Grid', routerLink: ['app', 'grid', this.projectId], icon: 'pi pi-th-large'},
      {label: 'Calendar', routerLink: ['app', 'calendar', this.projectId], icon: 'pi pi-calendar'},
      {label: 'Chat', routerLink: ['app', 'chat', this.projectId], icon: 'pi pi-comments'},
    ] : [
      {label: 'Inbox', routerLink: ['app', 'inbox', 'undefined'], icon: 'pi pi-inbox'}
    ];
  }

  /**
   * A convenience method to open the settings dialog
   */
  showSettings() {
    this.settings.show();
  }

  /**
   * When the user clicks the close button, close the window
   * @param _ - The mouse event (not used)
   */
  close(_: MouseEvent) {
    window.close()
  }

  /**
   * When the user clicks the minimize button, send a message to the main process to minimize the window
   * @param _ - The mouse event (not used)
   */
  minimize(_: MouseEvent) {
    window.api.send('A2E:Window:Minimize');
  }

  /**
   * When the user clicks the maximize button, send a message to the main process to maximize the window
   * @param _ - The mouse event (not used)
   */
  maximize(_: MouseEvent) {
    window.api.send('A2E:Window:Maximize');
  }

  /**
   * When the user clicks on a sidebar item, update the selected view and run the command if it exists
   * @param $event
   * @param item
   */
  onSidebarClick($event: MouseEvent, item: SidebarItem) {
    if ($event && item?.label) {
      this.selectedView = item.label === 'Settings' ? this.selectedView : item.label;
      if (item.command) {
        item.command();
      }
    }
  }

  /**
   * When the window resizes, send a message to the window resize observable
   */
  @HostListener('window:resize', ["$event"])
  windowResize(_: any) {
    this._windowResize.next({});
  }

  /**
   * When the user presses the refresh key, reload the page
   */
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

  /**
   * When the user presses the open projects key, toggle the project tree
   */
  @HostListener('document:keydown.Control.p')
  @HostListener('document:keydown.meta.p')
  keyPressOpenProjects() {
    this.projectTreeVisible = !this.projectTreeVisible;
  }

  /**
   * When the user presses the view 1 key, go to the inbox
   */
  @HostListener('document:keydown.Control.1')
  @HostListener('document:keydown.meta.1')
  goInbox() {
    this.router.navigate(['app', 'inbox', this.projectId]);
  }

  /**
   * When the user presses the view 2 key, go to the projects view
   */
  @HostListener('document:keydown.Control.2')
  @HostListener('document:keydown.meta.2')
  goProjects() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'projects', this.projectId]);
    }
  }

  /**
   * When the user presses the view 3 key, go to the graph view
   */
  @HostListener('document:keydown.Control.3')
  @HostListener('document:keydown.meta.3')
  goGraph() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'graph', this.projectId]);
    }
  }

  /**
   * When the user presses the view 4 key, go to the table view
   */
  @HostListener('document:keydown.Control.4')
  @HostListener('document:keydown.meta.4')
  goTable() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'table', this.projectId]);
    }
  }

  /**
   * When the user presses the view 5 key, go to the grid view
   */
  @HostListener('document:keydown.Control.5')
  @HostListener('document:keydown.meta.5')
  goGrid() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'grid', this.projectId]);
    }
  }

  /**
   * When the user presses the view 6 key, go to the calendar view
   */
  @HostListener('document:keydown.Control.6')
  @HostListener('document:keydown.meta.6')
  goCalendar() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'calendar', this.projectId]);
    }
  }

  /**
   * When the user presses settings menu key, show the seettings dialog
   */
  @HostListener('document:keydown.Control.,')
  @HostListener('document:keydown.meta.,')
  goSettings() {
    this.showSettings();
  }

  /**
   * Use prevent default to allow drag and drop to work properly
   * @param evt
   */
  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  /**
   * Handle the drop event by parsing the drag event and then importing any resultant sources
   * @param event
   */
  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    // Drop listener for importing files and links
    this.dnd.parseDragEvent(event).then((ksReq) => {
      if (ksReq) {
        this.factory.many(ksReq).then((ksList) => {
          if (ksList.length > 0) {
            ksList.forEach(ks => ks.importMethod = 'dnd');
            this.ingest.enqueue(ksList);
          }
        })
      }
    })
  }
}
