import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, DropListOrientation} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../services/ks-drop/ks-drop.service";
import {KcDialogService} from "../../services/dialog/kc-dialog.service";

@Component({
  selector: 'ks-drag-and-drop',
  templateUrl: './ks-drag-and-drop.component.html',
  styleUrls: ['./ks-drag-and-drop.component.css']
})
export class KsDragAndDropComponent implements OnInit, OnChanges {
  @Input()
  autoScroll: boolean = true;

  @Input()
  autoScrollStep: number = 32;

  @Input()
  ksListOrientation: DropListOrientation = 'vertical';

  @Input()
  ksList: KnowledgeSource[] = [];

  @Input()
  ksListId: string = '';

  @Input()
  ksWarnOnDelete: boolean = true;

  @Input()
  ksListManualSortingDisabled: boolean = false;

  @Input()
  ksToolTips: boolean = false;

  @Input()
  ksToolTipDelay: number = 0;

  @Input()
  ksEnableContextMenu: boolean = false;

  @Input()
  ksListSortBy?: 'a-Z' | 'Z-a' | 'created' | 'accessed' | 'modified';

  @Output()
  ksListChanged = new EventEmitter<KnowledgeSource[]>();

  @Output()
  ksListEntered = new EventEmitter<CdkDragEnter>();

  @Output()
  ksListExited = new EventEmitter<CdkDragExit>();

  @Output()
  ksListSorted = new EventEmitter<KnowledgeSource[]>();

  @Output()
  ksSelected = new EventEmitter<KnowledgeSource>();

  @Output()
  ksRemoved = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuCopyLinkClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuEditClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuOpenClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuPreviewClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuRemoveClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuShowFileClicked = new EventEmitter<KnowledgeSource>();

  ksForContextMenu?: KnowledgeSource;

  isDisplayContextMenu: boolean = false;

  rightClickMenuPositionX: number = 0;

  rightClickMenuPositionY: number = 0;

  @ViewChild('ksDnd', {static: true}) private cdkDropList!: CdkDropList;

  @ViewChild('ksDnd', {static: true}) private elementRef!: ElementRef;

  constructor(private ksDropService: KsDropService,
              private dialogService: KcDialogService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ksListId) {
      this.cdkDropList.id = changes.ksListId.currentValue;
      this.elementRef.nativeElement.id = changes.ksListId.currentValue;
    }

    if (changes.ksListSortBy) {
      this.sortItems();
    }

    if (changes.ksListOrientation) {
      this.cdkDropList.orientation = changes.ksListOrientation.currentValue;
      if (changes.ksListOrientation?.currentValue === 'horizontal') {
        this.elementRef.nativeElement.classList.remove('ks-dnd-list');
        this.elementRef.nativeElement.classList.add('ks-dnd-list-horizontal');
      }
    }
  }

  ngOnInit(): void {
  }

  removeKs(ks: KnowledgeSource) {
    if (this.ksWarnOnDelete) {
      this.dialogService.openWarnDeleteKs(ks).then((confirmed) => {
        if (confirmed) {
          this.ksList = this.ksList.filter(k => k.id.value !== ks.id.value);
          this.ksListChanged.emit(this.ksList);
          this.ksRemoved.emit(ks);
        }
      })
    } else {
      this.ksList = this.ksList.filter(k => k.id.value !== ks.id.value);
      this.ksListChanged.emit(this.ksList);
      this.ksRemoved.emit(ks);
    }
  }

  ksDropped($event: CdkDragDrop<KnowledgeSource[], any>) {
    this.ksDropService.drop($event);

    if ($event.container.id === $event.previousContainer.id) {
      this.ksListSorted.emit(this.ksList);
    } else {
      this.ksListChanged.emit(this.ksList);
    }
  }

  ksContextMenu($event: MouseEvent, ks: KnowledgeSource) {
    this.ksForContextMenu = ks;
    this.isDisplayContextMenu = true;
    this.rightClickMenuPositionX = $event.clientX;
    this.rightClickMenuPositionY = $event.clientY;
  }

  getRightClickMenuStyle() {
    return {
      position: 'fixed',
      left: `${this.rightClickMenuPositionX}px`,
      top: `${this.rightClickMenuPositionY}px`
    }
  }

  @HostListener('document:click')
  documentClick(): void {
    this.isDisplayContextMenu = false;
  }

  private sortItems() {
    // TODO: implement list sorting
    switch (this.ksListSortBy) {
      case 'a-Z':
        break;
      case 'Z-a':
        break;
      case 'created':
        break;
      case 'accessed':
        break;
      case 'modified':
        break;
      default:
    }
  }
}
