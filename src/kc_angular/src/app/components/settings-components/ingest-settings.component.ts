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
import {Component, OnInit, ViewChild} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {ElectronIpcService} from "../../services/ipc-services/electron-ipc.service";
import {IngestSettingsModel} from "../../../../../kc_shared/models/settings.model";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {InputText} from "primeng/inputtext";
import {PromptForDirectoryRequest} from "../../../../../kc_shared/models/electron.ipc.model";

export type FileManagerTarget = 'autoscan' | 'all';

export type SelectButtonOption = {
  name: string,
  value: FileManagerTarget,
  disabled: boolean
}

@Component({
  selector: 'app-ingest-settings',
  template: `
    <div class="p-fluid grid">
      <div class="col-12">
        <p-panel #autoscanPanel>
          <ng-template pTemplate="header">
            <div class="flex-row-center-between w-full">
              <b>Autoscan</b>
              <p-inputSwitch [(ngModel)]="ingestSettings.autoscan.enabled"
                             (onChange)="onAutoscanChange($event)">
              </p-inputSwitch>
            </div>
          </ng-template>

          <ng-template pTemplate="content">
            <div class="p-fluid grid m-4">
              <div class="col-12">
                <b>Interval</b>
              </div>
              <div class="col-4 p-fluid">
                <p-inputNumber [(ngModel)]="ingestSettings.autoscan.interval"
                               [suffix]="' seconds'"
                               [disabled]="!ingestSettings.autoscan.enabled"
                               (ngModelChange)="onAutoscanInterval($event)"
                               [showButtons]="true"
                               [useGrouping]="false"
                               [allowEmpty]="false"
                               [min]="10"
                               [max]="600">
                </p-inputNumber>
              </div>

              <div class="col-12">
                <b>Autoscan Location</b>
              </div>
              <div class="col-12 p-fluid p-inputgroup p-float-label">
                <button pButton
                        [disabled]="!ingestSettings.autoscan.enabled"
                        icon="pi pi-folder"
                        (click)="getAutoscanPath()">
                </button>
                <input pInputText type="text"
                       #autoscanLocation
                       disabled
                       id="autoscanLocation"
                       style="width: calc(100% - 10rem)"
                       [(ngModel)]="ingestSettings.autoscan.path">
                <button pButton
                        label="Show"
                        (click)="show(autoscanLocation.value)">
                </button>
                <br>
                <small class="text-gray-500">Files saved to this location will automatically be added to Up Next.</small>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
      <div class="col-12">
        <p-panel #fileManager>
          <ng-template pTemplate="header">
            <div class="flex-row-center-between w-full">
              <b>File Manager</b>
            </div>
          </ng-template>

          <ng-template pTemplate="content">
            <div class="p-fluid grid m-4">
              <div class="col-12">
                <b>Managed Files</b>
              </div>
              <div class="col-6">
                <p-selectButton [options]="fileManagerStates"
                                [(ngModel)]="ingestSettings.manager.target"
                                (onChange)="onFileManagerTargetChange($event)"
                                optionLabel="name"
                                optionValue="value"
                                optionDisabled="disabled">
                </p-selectButton>
              </div>

              <div class="col-12 mt-4">
                <b>Storage Location</b>
              </div>
              <div class="col-12 p-fluid p-inputgroup p-float-label">
                <button pButton
                        icon="pi pi-folder"
                        disabled
                        (click)="getStoragePath()">
                </button>
                <input pInputText type="text"
                       #filestorage
                       disabled
                       style="width: calc(100% - 10rem)"
                       [(ngModel)]="ingestSettings.manager.storageLocation">
                <button pButton label="Show"
                        (click)="show(filestorage.value)">
                </button>
                <br>
                <small class="text-gray-500">Files will be moved from their original location to this location.</small>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
      <div class="col-12">
        <p-panel #extensionpanel>
          <ng-template pTemplate="header">
            <div class="flex-row-center-between w-full">
              <b>Browser Extensions</b>
              <p-inputSwitch [(ngModel)]="ingestSettings.extensions.enabled"
                             (onChange)="onExtensionChange($event)">
              </p-inputSwitch>
            </div>
          </ng-template>

          <ng-template pTemplate="content">
            <div class="p-fluid grid m-4">
              <div class="col-12">
                <b>Port</b>
              </div>
              <div class="col-4 p-fluid">
                <p-inputNumber [(ngModel)]="ingestSettings.extensions.port"
                               [disabled]="!ingestSettings.extensions.enabled"
                               (ngModelChange)="onExtensionPort($event)"
                               [showButtons]="true"
                               [useGrouping]="false"
                               [allowEmpty]="false"
                               [min]="1025"
                               [max]="65535">
                </p-inputNumber>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
    </div>
  `,
  styles: []
})
export class IngestSettingsComponent implements OnInit {
  @ViewChild('extensionPort') port!: InputText;

  ingestSettings: IngestSettingsModel;

  fileManagerStates: SelectButtonOption[] = [
    {name: 'Autoscan Files Only', value: 'autoscan', disabled: false},
    {name: 'All Imported Files', value: 'all', disabled: false}
  ];

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private settingsService: SettingsService,
              private notifications: NotificationsService,
              private ipcService: ElectronIpcService) {
    this.ingestSettings = settingsService.defaults.ingest;

    settingsService.ingest.subscribe(ingestSettings => {
      this.ingestSettings = ingestSettings;
      this.setState(ingestSettings);
    });
  }

  setState(ingest: IngestSettingsModel) {
    if (ingest.autoscan.enabled) {
      this.ingestSettings.manager.enabled = true;
    } else {
      this.ingestSettings.manager.enabled = ingest.manager.enabled;
    }
  }

  ngOnInit(): void {
  }

  onAutoscanChange($event: any) {
    if ($event.checked === undefined) {
      return;
    }
    this.ingestSettings.autoscan.enabled = $event.checked;
    this.settingsService.set({ingest: this.ingestSettings});
    this.notifications.debug('IngestSettings', 'Autoscan', $event.checked ? 'Enabled' : 'Disabled', 'toast');
  }

  onFileManagerChange($event: any) {
    if ($event.checked === undefined) {
      return;
    }
    this.ingestSettings.manager.enabled = $event.checked;
    this.settingsService.set({ingest: this.ingestSettings});
    this.notifications.debug('IngestSettings', 'File Manager', $event.checked ? 'Enabled' : 'Disabled', 'toast');
  }

  show(location: string) {
    this.ipcService.showItemInFolder(location);
    this.notifications.debug('IngestSettings', 'Locating Folder', location, 'toast');
  }

  getStoragePath() {
    // let req: PromptForDirectoryRequest = {
    //   title: 'Local Storage Location',
    //   defaultPath: this.ingestSettings.manager.storageLocation,
    //   properties: ['openDirectory', 'showHiddenFiles', 'createDirectory']
    // }
    // this.ipcService.promptForDirectory(req).then((path) => {
    //   this.ingestSettings.manager.storageLocation = path;
    //   this.settingsService.set({ingest: this.ingestSettings});
    //   this.notifications.debug('IngestSettings', 'Storage Path Changed', path, 'toast');
    // }).catch((reason) => {
    //   this.notifications.error('IngestSettings', 'Invalid Storage Path', reason);
    //   console.error(reason);
    // });
  }

  getAutoscanPath() {
    let req: PromptForDirectoryRequest = {
      title: 'Autoscan Location',
      defaultPath: this.ingestSettings.autoscan.path,
      properties: ['openDirectory']
    }
    this.ipcService.promptForDirectory(req).then((path) => {
      this.ingestSettings.autoscan.path = path;
      this.settingsService.set({ingest: this.ingestSettings});
      this.notifications.debug('IngestSettings', 'Autoscan Path Changed', path, 'toast');
    }).catch((reason) => {
      this.notifications.error('IngestSettings', 'Invalid Autoscan Path', reason);
      console.error(reason);
    });
  }

  onFileManagerTargetChange($event: any) {
    if (!$event.value) {
      this.notifications.warn('IngestSettings', 'Invalid Target', 'Received an event that contains no value.', 'toast');
      return;
    } else {
      let target = this.fileManagerStates.find(f => f.value === $event.value)?.name;
      this.notifications.debug('IngestSettings', 'Managed Files', target ?? $event.value)
      this.settingsService.set({ingest: this.ingestSettings});
    }
  }

  onExtensionChange($event: any) {
    if ($event.checked === undefined) {
      this.notifications.warn('IngestSettings', 'Invalid Setting', 'Browser Extension cannot be changed.', 'toast');
      return;
    } else {
      this.notifications.debug('IngestSettings', 'Browser Extensions', $event.checked ? 'Enabled' : 'Disabled', 'toast');
      this.ingestSettings.extensions.enabled = $event.checked;
      this.settingsService.set({ingest: this.ingestSettings});
    }
  }

  onExtensionPort($event: any) {
    if (!$event) {
      return;
    }
    this.notifications.debug('IngestSettings', 'Browser Extension Port', $event, 'toast');
    this.settingsService.set({ingest: this.ingestSettings});
  }

  onAutoscanInterval($event: any) {
    if (!$event) {
      return;
    }
    this.notifications.debug('IngestSettings', 'Autoscan Interval', `${$event} seconds`, 'toast');
    this.settingsService.set({ingest: this.ingestSettings});
  }
}
