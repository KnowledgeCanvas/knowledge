import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-action-bar',
  template: `
    <div class="w-full flex flex-row align-items-center justify-content-center">
      <button pButton *ngIf="showEdit"
              class="m-1 p-button-rounded p-button-plain p-button-text p-button-raised p-button-info"
              icon="pi pi-info"
              pTooltip="Details"
              [tooltipOptions]="actionButtonTooltipOptions"
              (click)="onEdit.emit()">
      </button>
      <button pButton *ngIf="showPreview"
              class="m-1 p-button-rounded p-button-plain p-button-text p-button-raised  p-button-info"
              icon="pi pi-eye"
              pTooltip="Preview"
              [tooltipOptions]="actionButtonTooltipOptions"
              (click)="onPreview.emit()">
      </button>
      <button pButton *ngIf="showOpen"
              class="m-1 p-button-rounded p-button-plain p-button-text p-button-raised  p-button-info"
              icon="pi pi-external-link"
              pTooltip="Open In..."
              [tooltipOptions]="actionButtonTooltipOptions"
              (click)="onOpen.emit()">
      </button>
      <button pButton *ngIf="showRemove"
              class="m-1 p-button-rounded p-button-plain p-button-text p-button-raised p-button-info"
              icon="pi pi-trash"
              pTooltip="Remove"
              [tooltipOptions]="actionButtonTooltipOptions"
              (click)="onRemove.emit()">
      </button>
      <p-toggleButton *ngIf="showFlag"
                      [(ngModel)]="flagged"
                      class="m-1"
                      styleClass="p-button-rounded"
                      onIcon="pi pi-flag" offIcon="pi pi-flag"
                      pTooltip="Important"
                      [tooltipOptions]="actionButtonTooltipOptions"
                      (onChange)="onFlagged.emit($event)">
      </p-toggleButton>
    </div>
  `,
  styles: [``]
})
export class KsActionsComponent implements OnInit {

  @Input() actionButtonTooltipOptions = {
    showDelay: 750,
    tooltipPosition: 'top'
  };

  @Input() flagged?: boolean = false;

  @Input() showFlag: boolean = true;

  @Input() showEdit: boolean = true;

  @Input() showPreview: boolean = true;

  @Input() showOpen: boolean = true;

  @Input() showRemove: boolean = true;

  @Output() onEdit = new EventEmitter<any>();

  @Output() onPreview = new EventEmitter<any>();

  @Output() onOpen = new EventEmitter<any>();

  @Output() onRemove = new EventEmitter<any>();

  @Output() onFlagged = new EventEmitter<any>();


  constructor() {

  }

  ngOnInit(): void {
  }

}
