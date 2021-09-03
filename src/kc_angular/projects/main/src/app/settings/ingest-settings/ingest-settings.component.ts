import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {IngestSettingsModel} from "projects/ks-lib/src/lib/models/settings.model";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {
  ElectronIpcService,
  PromptForDirectoryRequest
} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";

@Component({
  selector: 'app-ingest-settings',
  templateUrl: './ingest-settings.component.html',
  styleUrls: ['./ingest-settings.component.scss']
})
export class IngestSettingsComponent implements OnInit, OnChanges {
  @Input() ingestSettings: IngestSettingsModel = {autoscan: false, managed: false};
  @Output() settingsModified = new EventEmitter<IngestSettingsModel>();
  interval: string = '';
  intervalChanged: boolean = false;
  autoscanHelp: string = 'When autoscan is enabled, you can drop files into a pre-selected directory and Knowledge Canvas will automatically import those files for you.';
  private MIN_INTERVAL = 10;
  private MAX_INTERVAL = 120;

  constructor(private ipcService: ElectronIpcService, private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.interval = `${changes.ingestSettings.currentValue.interval / 1000}`;
  }

  folderSelect() {
    let request: PromptForDirectoryRequest = {
      title: 'Select a new location for Knowledge Canvas Autoscan',
      defaultPath: this.ingestSettings.autoscanLocation,
      buttonLabel: 'Use for Autoscan',
      properties: ['openDirectory', "createDirectory"],
      macOsMessage: 'Knowledge Canvas Autoscan'
    }

    this.ipcService.promptForDirectory(request).then((directory) => {
      this.ingestSettings.autoscanLocation = directory;
      this.updateSettings();
    });
  }

  autoscanClicked(autoscan: MatSlideToggleChange) {
    if (autoscan.checked) {
      this.ingestSettings.managed = true;
    } else {

    }
    this.updateSettings();
  }

  autoscanLocationClicked($event: Event) {
    this.updateSettings();
  }

  managedClicked($event: MatSlideToggleChange) {
    this.updateSettings();
  }

  preserveClicked($event: MatSlideToggleChange) {
    this.updateSettings();
  }

  onIntervalChange($event: Event) {
    let newInterval: number = this.interval as any;

    if (newInterval > this.MAX_INTERVAL || newInterval < this.MIN_INTERVAL) {
      let config: MatSnackBarConfig = {verticalPosition: 'bottom', duration: 2000};
      this.snackbar.open(`'Must be a number between ${this.MIN_INTERVAL} - ${this.MAX_INTERVAL}`, 'Dismiss', config);
      this.interval = (newInterval < this.MIN_INTERVAL) ? `${this.MIN_INTERVAL}` : `${this.MAX_INTERVAL}`;
    }

    if (this.ingestSettings.interval) {
      this.intervalChanged = newInterval !== (this.ingestSettings.interval / 1000);
    } else {
      this.intervalChanged = true;
    }
  }

  applyIntervalChange() {
    let newInterval: number = this.interval as any;
    if (newInterval >= this.MIN_INTERVAL && newInterval <= this.MAX_INTERVAL) {
      this.ingestSettings.interval = newInterval * 1000;
      this.updateSettings();
      this.intervalChanged = false;
    } else {
      console.error(`Interval must be a number between ${this.MIN_INTERVAL} and ${this.MAX_INTERVAL}...`);
    }
  }

  private updateSettings() {
    this.settingsModified.emit({
      autoscan: this.ingestSettings.autoscan,
      autoscanLocation: this.ingestSettings.autoscanLocation,
      managed: this.ingestSettings.managed,
      preserveTimestamps: this.ingestSettings.preserveTimestamps,
      interval: this.ingestSettings.interval
    });
    this.snackbar.open('Ingest Settings Saved!', 'Dismiss', {
      verticalPosition: 'bottom',
      duration: 3000,
      panelClass: 'kc-success'
    });
  }
}
