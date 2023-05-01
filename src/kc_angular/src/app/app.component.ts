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
import { Component, HostListener } from '@angular/core';
import { ChildrenOutletContexts, NavigationEnd, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '@environments/environment';
import { SettingsService } from '@services/ipc-services/settings.service';
import { ProjectService } from '@services/factory-services/project.service';
import { KsFactoryService } from '@services/factory-services/ks-factory.service';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import { ThemeService } from '@services/user-services/theme.service';
import { NotificationsService } from '@services/user-services/notifications.service';
import { IngestService } from '@services/ingest-services/ingest.service';
import { DragAndDropService } from '@services/ingest-services/drag-and-drop.service';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { ProjectTreeFactoryService } from '@services/factory-services/project-tree-factory.service';
import { KsDetailsComponent } from '@components/source-components/ks-details.component';
import { map, take, tap } from 'rxjs/operators';
import { BehaviorSubject, throttleTime } from 'rxjs';
import { StartupService } from '@services/ipc-services/startup.service';
import { ProjectCommandService } from '@services/command-services/project-command.service';
import { ProjectDetailsComponent } from '@components/project-components/project-details.component';
import { fadeIn, fadeInAndOut, flyInOut } from './animations';
import { ChatService } from '@services/chat-services/chat.service';

type SidebarItem = {
  label: string;
  routerLink?: any;
  command?: any;
  icon: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeInAndOut, flyInOut, fadeIn],
})
export class AppComponent {
  /**
   * The current project id
   */
  projectId = '';

  /**
   * Whether the project tree is visible
   */
  projectTreeVisible = true;

  /**
   * Whether the app is ready to show the main view
   */
  readyToShow = false;

  /**
   * The number of items in the inbox (used for the badge)
   */
  inboxBadge = 0;

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
    {
      label: 'Inbox',
      routerLink: ['app', 'inbox', 'undefined'],
      icon: 'pi pi-inbox',
    },
  ];

  /**
   * The currently selected view
   */
  selectedView: string = this.sidebarItems[0].label;

  /**
   * The host OS (windows, macos, linux)
   */
  os = '';

  /**
   * The route animation data, used to determine which animation to use when navigating between views
   */
  routeAnimationData = 'Inbox';

  /**
   * Whether to use animations in the app or not
   */
  animate = true;

  /**
   * The subject used to emit window resize events
   * @private
   */
  private _windowResize = new BehaviorSubject({});

  /**
   * The application component constructor - injects all the services and sets up the subscriptions
   */
  constructor(
    private settings: SettingsService,
    private notifications: NotificationsService,
    private startup: StartupService,
    private command: KsCommandService,
    private pCommand: ProjectCommandService,
    private chat: ChatService,
    private dialog: DialogService,
    private dnd: DragAndDropService,
    private factory: KsFactoryService,
    private projects: ProjectService,
    private ipc: ElectronIpcService,
    private ingest: IngestService,
    private tree: ProjectTreeFactoryService,
    private router: Router,
    private contexts: ChildrenOutletContexts,
    private themes: ThemeService
  ) {
    /* Set window icons based on OS */
    settings.all
      .pipe(
        take(2),
        map((s) => s.system),
        tap((systemSettings) => {
          if (systemSettings && systemSettings.osPlatform) {
            this.os = systemSettings.osPlatform;
          }
        })
      )
      .subscribe();

    /* Show tutorial as long as showFirstRunTutorial is true */
    settings.all
      .pipe(
        take(2),
        map((s) => s.user),
        tap((userSettings) => {
          if (!userSettings) {
            return;
          }
          if (userSettings.tutorials === undefined) {
            settings.set({
              user: { tutorials: { showFirstRunTutorial: true } },
            });
          } else if (userSettings.tutorials.showFirstRunTutorial) {
            setTimeout(() => {
              this.startup.tutorial().subscribe((showAgain) => {
                settings.set({
                  user: { tutorials: { showFirstRunTutorial: showAgain } },
                });
              });
            }, 1000);
          }
        })
      )
      .subscribe();

    /* enable/disable animations */
    settings.display
      .pipe(
        map((d) => d.animations),
        tap((animations) => {
          this.animate = animations;
        })
      )
      .subscribe();

    /* Listen for route changes and update the sidebar accordingly */
    router.events
      .pipe(
        tap((events) => {
          if (events instanceof NavigationEnd) {
            const segments = events.url.split('/').filter((f) => f.length);
            const visibleRoute = segments[1];
            switch (visibleRoute) {
              case 'inbox':
              case '(inbox':
                this.selectedView = 'Inbox';
                break;
              case 'projects':
              case '(projects':
                this.selectedView = 'Projects';
                break;
              case 'table':
              case '(table':
                this.selectedView = 'Table';
                break;
              case 'grid':
              case '(grid':
                this.selectedView = 'Grid';
                break;
              case 'graph':
              case '(graph':
                this.selectedView = 'Graph';
                break;
              case 'calendar':
              case '(calendar':
                this.selectedView = 'Calendar';
                break;
              case 'chat':
              case '(chat':
                this.selectedView = 'Chat';
                break;
              default:
                break;
            }
            if (this.animate) {
              this.routeAnimationData = this.selectedView;
            }
          }
        })
      )
      .subscribe();

    /* Listen for Source Info Dialog events, open/close the dialog as necessary */
    this.command.ksDetailEvent
      .pipe(
        tap((ks) => {
          if (ks?.force && this.sourceInfoDialog) {
            this.sourceInfoDialog.close();
          }
          if (ks && !this.sourceInfoDialog) {
            this.sourceInfoDialog = this.dialog.open(KsDetailsComponent, {
              data: { ks: ks },
              width: '100vw !important',
              height: '100vh !important',
              styleClass: 'min-h-screen',
              maximizable: true,
              showHeader: false,
              style: { margin: 0, padding: 0, overflow: 'unset' },
              contentStyle: {
                margin: 0,
                padding: 0,
                height: '100vh',
                overflow: 'hidden',
              },
              closeOnEscape: true,
            });
            setTimeout(() => {
              if (this.sourceInfoDialog) {
                this.sourceInfoDialog.maximize({});
              }
            });
            this.sourceInfoDialog.onClose
              .pipe(
                tap(() => {
                  this.sourceInfoDialog = undefined;
                })
              )
              .subscribe();
          }
        })
      )
      .subscribe();

    /* Listen for Project Info Dialog events, open/close the dialog as necessary */
    pCommand.detailEvent
      .pipe(
        tap((project) => {
          if (!project) {
            return;
          }
          this.projectInfoDialog = this.dialog.open(ProjectDetailsComponent, {
            data: { project: project },
            showHeader: false,
            contentStyle: { 'border-radius': '10px' },
            closeOnEscape: true,
          });
          this.projectInfoDialog.onClose
            .pipe(
              tap(() => {
                this.projectInfoDialog = undefined;
              })
            )
            .subscribe();
        })
      )
      .subscribe();

    /* Use the ingest queue to update the inbox badge on the sidebar */
    ingest.queue
      .pipe(
        tap((upNext) => {
          this.inboxBadge = upNext.length;
        })
      )
      .subscribe();

    /* When the project changes, update the sidebar and the project id */
    projects.currentProject
      .pipe(
        tap((project) => {
          this.projectId = project?.id.value ?? '';
          this.setSidebar();
        })
      )
      .subscribe();

    /* Ensure the theme has been completely loaded on startup */
    themes.setLocal().then(() => {
      setTimeout(() => {
        this.readyToShow = true;
      }, Math.floor(Math.random() * 3000));
    });

    /* Listen for window resize events and update the sidebar visibility accordingly */
    this._windowResize
      .asObservable()
      .pipe(
        throttleTime(50),
        tap(() => {
          this.projectTreeVisible = window.innerWidth >= 1200;
        })
      )
      .subscribe();
  }

  /* Sets the sidebar icons and router links. If there are no projects, only display inbox. */
  setSidebar() {
    this.sidebarItems =
      this.projectId && this.projectId.trim().length === 36
        ? [
            {
              label: 'Inbox',
              routerLink: ['app', 'inbox', this.projectId],
              icon: 'pi pi-inbox',
            },
            {
              label: 'Graph',
              routerLink: ['app', 'graph', this.projectId],
              icon: 'pi pi-sitemap',
            },
            {
              label: 'Table',
              routerLink: ['app', 'table', this.projectId],
              icon: 'pi pi-table',
            },
            {
              label: 'Grid',
              routerLink: ['app', 'grid', this.projectId],
              icon: 'pi pi-th-large',
            },
            {
              label: 'Calendar',
              routerLink: ['app', 'calendar', this.projectId],
              icon: 'pi pi-calendar',
            },
            {
              label: 'Chat',
              routerLink: ['app', 'chat', this.projectId],
              icon: 'pi pi-comments',
            },
          ]
        : [
            {
              label: 'Inbox',
              routerLink: ['app', 'inbox', 'undefined'],
              icon: 'pi pi-inbox',
            },
          ];
  }

  /* A convenience method to open the settings dialog */
  showSettings() {
    this.settings.show();
  }

  /* When the user clicks the close button, close the window */
  close() {
    window.close();
  }

  /* When the user clicks the minimize button, send a message to the main process to minimize the window */
  minimize() {
    window.api.send('A2E:Window:Minimize');
  }

  /* When the user clicks the maximize button, send a message to the main process to maximize the window */
  maximize() {
    window.api.send('A2E:Window:Maximize');
  }

  /**
   * When the user clicks on a sidebar item, update the selected view and run the command if it exists
   * @param item The sidebar item that was clicked
   */
  onSidebarClick(item: SidebarItem) {
    if (item?.label) {
      this.selectedView =
        item.label === 'Settings' ? this.selectedView : item.label;
      if (item.command) {
        item.command();
      }
    }
  }

  /* When the window resizes, send a message to the window resize observable */
  @HostListener('window:resize', ['$event'])
  windowResize() {
    this._windowResize.next({});
  }

  /* When the user presses the refresh key, reload the page */
  @HostListener('document:keydown.Control.r', ['$event'])
  @HostListener('document:keydown.f5', ['$event'])
  @HostListener('document:keydown.meta.r', ['$event'])
  refresh(event: KeyboardEvent) {
    if (!event) {
      this.notifications.warn('App', 'Invalid Keystroke', 'Refresh');
      return;
    }
    try {
      event.preventDefault();
    } catch (e) {
      this.notifications.error(
        'App',
        'Unexpected Event',
        'Host Listener provided an invalid event for refresh command.'
      );
    }
    if (!environment.production) {
      location.reload();
    }
  }

  /* When the user presses the open projects key, toggle the project tree */
  @HostListener('document:keydown.Control.p')
  @HostListener('document:keydown.meta.p')
  keyPressOpenProjects() {
    this.projectTreeVisible = !this.projectTreeVisible;
  }

  /* When the user presses the view 1 key, go to the inbox */
  @HostListener('document:keydown.Control.1')
  @HostListener('document:keydown.meta.1')
  goInbox() {
    this.router.navigate(['app', 'inbox', this.projectId]);
  }

  /* When the user presses the view 3 key, go to the graph view */
  @HostListener('document:keydown.Control.2')
  @HostListener('document:keydown.meta.2')
  goGraph() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'graph', this.projectId]);
    }
  }

  /* When the user presses the view 4 key, go to the table view */
  @HostListener('document:keydown.Control.3')
  @HostListener('document:keydown.meta.3')
  goTable() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'table', this.projectId]);
    }
  }

  /* When the user presses the view 5 key, go to the grid view */
  @HostListener('document:keydown.Control.4')
  @HostListener('document:keydown.meta.4')
  goGrid() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'grid', this.projectId]);
    }
  }

  /* When the user presses the view 6 key, go to the calendar view */
  @HostListener('document:keydown.Control.5')
  @HostListener('document:keydown.meta.5')
  goCalendar() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'calendar', this.projectId]);
    }
  }

  @HostListener('document:keydown.Control.6')
  @HostListener('document:keydown.meta.6')
  goChat() {
    if (this.projectId.length > 0) {
      this.router.navigate(['app', 'chat', this.projectId]);
    }
  }

  /* When the user presses settings menu key, show the seettings dialog */
  @HostListener('document:keydown.Control.,')
  @HostListener('document:keydown.meta.,')
  goSettings() {
    this.showSettings();
  }

  /* Use prevent default to allow drag and drop to work properly */
  @HostListener('dragover', ['$event']) onDragOver(evt: any) {
    evt.preventDefault();
  }

  /**
   * Handle the drop event by parsing the drag event and then importing any resultant sources
   * @param event
   */
  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    this.dnd
      .parseDragEvent(event)
      .then((ksReq) => {
        if (ksReq) {
          this.factory.many(ksReq).then((ksList) => {
            if (ksList.length > 0) {
              ksList.forEach((ks) => (ks.importMethod = 'dnd'));
              this.ingest.enqueue(ksList);
            }
          });
        }
      })
      .catch((reason) => {
        this.notifications.error('App', 'Unexpected Error', reason);
      });
  }
}
