import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";

export interface ContextMenuModel {
  menuText: string;
  menuEvent: string;
  menuIcon?: string
}

@Component({
  selector: 'ks-lib-ks-context-menu',
  templateUrl: './ks-context-menu.component.html',
  styleUrls: ['./ks-context-menu.component.scss']
})
export class KsContextMenuComponent implements OnInit {
  @Input() contextMenuItems!: Array<ContextMenuModel>;
  @Input() ks?: KnowledgeSource;
  @Output() ksMenuPreviewClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksMenuOpenClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksMenuShowFileClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksMenuCopyLinkClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksMenuEditClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksMenuRemoveClicked = new EventEmitter<KnowledgeSource>();
  @ViewChild(MatMenu) menu!: MatMenu;
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.trigger.openMenu();
    }, 50)
  }
}
