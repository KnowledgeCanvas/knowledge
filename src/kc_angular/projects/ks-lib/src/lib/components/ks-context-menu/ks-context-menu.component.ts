import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";

export interface ContextMenuModel {
  menuText: string;
  menuAction: EventEmitter<KnowledgeSource>;
  menuIcon: string
}

@Component({
  selector: 'ks-lib-ks-context-menu',
  templateUrl: './ks-context-menu.component.html',
  styleUrls: ['./ks-context-menu.component.scss']
})
export class KsContextMenuComponent implements OnInit {
  @Input()
  ks?: KnowledgeSource;

  @Output()
  ksMenuPreviewClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuOpenClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuShowFileClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuCopyLinkClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuEditClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuRemoveClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuViewProjectClicked = new EventEmitter<KnowledgeSource>();

  @Input()
  contextMenuItems: Array<ContextMenuModel> = [
    {
      menuText: 'Preview',
      menuAction: this.ksMenuPreviewClicked,
      menuIcon: 'preview'
    },
    {
      menuText: 'Open in...',
      menuAction: this.ksMenuOpenClicked,
      menuIcon: 'open_in_browser'
    },
    {
      menuText: 'Copy link',
      menuAction: this.ksMenuCopyLinkClicked,
      menuIcon: 'content_copy'
    },
    {
      menuText: 'Edit',
      menuAction: this.ksMenuEditClicked,
      menuIcon: 'edit'
    },
    {
      menuText: 'Remove',
      menuAction: this.ksMenuRemoveClicked,
      menuIcon: 'remove_circle'
    },
    {
      menuText: 'View Project',
      menuAction: this.ksMenuViewProjectClicked,
      menuIcon: 'assistant_direction'
    },
  ];


  @ViewChild(MatMenu)
  menu!: MatMenu;

  @ViewChild(MatMenuTrigger)
  trigger!: MatMenuTrigger

  constructor() {
  }

  ngOnInit(): void {
    if (this.ks && this.ks.ingestType === 'file') {
      this.contextMenuItems.push({
        menuText: 'Show in folder',
        menuAction: this.ksMenuShowFileClicked,
        menuIcon: 'folder_open'
      })
    }

    setTimeout(() => {
      this.trigger.openMenu();
    }, 50)
  }
}
