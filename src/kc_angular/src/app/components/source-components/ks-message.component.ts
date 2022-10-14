import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";

@Component({
  selector: 'app-ks-message',
  template: `
    <div *ngIf="!ks" class="flex-col-center-between w-full h-full border-bottom-1 border-400 p-2">
      <div class="flex-row-center-between w-full pb-2">
        <p-skeleton size="40px" shape="circle" class="pr-2"></p-skeleton>
        <p-skeleton class="w-full" height="2rem" shape="rectangle"></p-skeleton>
      </div>
      <div class="flex-row-center-between w-full">
        <p-skeleton class="w-full pr-2 mr-2" height="1.5rem" shape="rectangle"></p-skeleton>
        <p-skeleton class="w-full" height="1.5rem" shape="rectangle"></p-skeleton>
      </div>
    </div>

    <div *ngIf="ks" class="flex-col-center-between w-full h-full border-bottom-1 border-400 p-2">
      <div class="flex-row-center-between w-full pb-2">
        <app-ks-icon [ks]="ks"
                     [allowClickThrough]="false"
                     style="height: 40px; width: 40px"
                     class="pr-2 flex align-items-center">
        </app-ks-icon>

        <div #titleContainer class="ks-message-title-and-flag">
          <div class="ks-message-title font-bold">{{ks.title | truncate:[titleContainer.offsetWidth / 4.5]}}</div>
          <div [class.pi-flag-fill]="ks.flagged"
               [class.pi-flag]="!ks.flagged"
               [class.text-400]="!ks.flagged"
               (click)="onKsFlagged($event, ks)"
               class="ks-message-flag pi px-2 hover:text-primary"></div>
        </div>
      </div>
      <div class="flex-row-center-between w-full text-500">
        <div class="text-left">{{ks.importMethod | importMethod}}</div>
        <div class="text-right">{{ks.dateCreated | date:'MM/dd/yy hh:mm a'}}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .ks-message-title-and-flag {
        display: flex;
        width: 100%;
        height: 40px;
        max-height: 40px;
        flex-direction: row;
        flex-wrap: nowrap;
        align-content: center;
        align-items: center;
        justify-content: space-between;

        .ks-message-title {
          min-width: 10rem;
          max-width: 40rem;
          max-height: 40px;
          overflow-wrap: anywhere;
          overflow: hidden;
          font-weight: 600 !important;
        }
      }
    `
  ]
})
export class KsMessageComponent implements OnInit {
  @Input() ks?: KnowledgeSource;

  constructor() {
  }

  ngOnInit(): void {
  }

  onKsFlagged($event: MouseEvent, ks: KnowledgeSource) {
    $event.preventDefault();
    $event.stopPropagation();
    ks.flagged = !ks.flagged;
  }
}
