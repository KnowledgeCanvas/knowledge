import {Component, OnInit} from '@angular/core';
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {StorageService} from "../../../../../ks-lib/src/lib/services/storage/storage.service";

@Component({
  selector: 'app-storage-settings',
  templateUrl: './storage-settings.component.html',
  styleUrls: ['./storage-settings.component.scss']
})
export class StorageSettingsComponent implements OnInit {

  constructor(private dialogService: KcDialogService,
              private storageService: StorageService) {
  }

  ngOnInit(): void {
  }

  deleteEverything() {
    let message = "The Knowledge Canvas will be restored to factory defaults and all of your data will be" +
      " deleted. This action is not reversible. Type 'Delete Permanently' below to continue."
    let dialogRequest: KcDialogRequest = {
      actionButtonText: "Delete Permanently",
      actionToTake: 'delete-input-required',
      cancelButtonText: "Cancel",
      message: message,
      title: "Delete Everything?",
      expectedInput: 'Delete Permanently'
    }
    this.dialogService.open(dialogRequest);
    this.dialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        console.warn('Ok... we\'re deleting everything!');
        this.storageService.factoryReset(confirmed);
      }
    });
  }

  deleteFiles() {
    let expectedInput = 'Delete all files'
    let message = `Delete all imported files? This action is not reversible. Type "${expectedInput}" below to continue.`
    let dialogRequest: KcDialogRequest = {
      actionButtonText: "Delete Permanently",
      actionToTake: 'delete-input-required',
      cancelButtonText: "Cancel",
      message: message,
      title: "Delete All Files?",
      expectedInput: expectedInput
    }
    this.dialogService.open(dialogRequest);
    this.dialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        console.warn('Ok... we\'re deleting all files!');
        this.storageService.deleteFile('delete-all-files');
      }
    });
  }
}
