import {Injectable} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../../../../main/src/app/knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class KsInfoDialogService {

  constructor(private dialog: MatDialog) {
  }

  open(ks: KnowledgeSource, projectId?: string): Promise<KsInfoDialogOutput> {

    let dialogInput: KsInfoDialogInput = {
      source: 'ks-drop-list',
      ks: ks,
      projectId: projectId
    }

    return new Promise<KsInfoDialogOutput>((resolve) => {
      const dialogRef = this.dialog.open(KsInfoDialogComponent, {
        minWidth: '65vw',
        width: 'auto',
        height: 'auto',
        maxHeight: '90vh',
        data: dialogInput,
        autoFocus: false
      });

      dialogRef.afterClosed().subscribe((result: KsInfoDialogOutput) => {
        console.log('Received output from KS INFO DIALOG: ', result);
        resolve(result);
      })
    })
  }
}
