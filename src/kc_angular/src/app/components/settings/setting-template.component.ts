import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-setting-template',
  template: `
    <div class="w-full flex flex-row justify-content-between align-items-center">
      <div class="flex flex-column gap-1">
        <div class="flex flex-row gap-2">
          <div>
            {{label}}
          </div>
          <div *ngIf="labelHelp">
            <div class="pi pi-question-circle" (click)="helpClick()" [pTooltip]="labelHelp + (labelHelpLink ? ' (click to learn more)' : '')"></div>
          </div>
        </div>
        <div class="text-500">
          {{labelSubtext}}
        </div>
      </div>

      <div class="flex flex-column gap-1">
        <ng-content select=".settings-input"></ng-content>
        <div class="w-full flex flex-row justify-content-between">
          <ng-content select=".settings-input-subtext-left"></ng-content>
          <ng-content select=".settings-input-subtext-right"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingTemplateComponent implements OnInit {
  @Input() label: string = '';

  @Input() labelSubtext: string = '';

  @Input() labelHelp: string = '';

  @Input() labelHelpLink: string = '';

  @Input() actionSubtext: string = '';

  @Input() actionDisabled: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  helpClick() {
    if (this.labelHelpLink) {
      window.open(this.labelHelpLink);
    }
  }
}
