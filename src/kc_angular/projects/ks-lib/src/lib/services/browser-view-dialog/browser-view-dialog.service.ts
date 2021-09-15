import {Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KsPreviewComponent, KsPreviewInput} from "../../../../../main/src/app/knowledge-source/ks-preview/ks-preview.component";

export interface BrowserViewDialogConfig {
  ks: KnowledgeSource
}

@Injectable({
  providedIn: 'root'
})
export class BrowserViewDialogService {
  constructor(public dialog: MatDialog) {
  }

  open(options: BrowserViewDialogConfig): MatDialogRef<KsPreviewComponent> {
    let ksPreviewInput: KsPreviewInput = {
      ks: options.ks
    }
    let config: MatDialogConfig = {
      autoFocus: false,
      minWidth: '95vw',
      width: 'auto',
      minHeight: '90vh',
      height: 'auto',
      maxHeight: 'calc(100vh - 72px)',
      data: ksPreviewInput
    }

    return this.dialog.open(KsPreviewComponent, config);
  }
}
