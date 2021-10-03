import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, DropListOrientation} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../services/ks-drop/ks-drop.service";
import {KcDialogService} from "../../services/dialog/kc-dialog.service";

@Component({
  selector: 'ks-lib-knowledge-source-drag-and-drop-list',
  templateUrl: './knowledge-source-drag-and-drop-list.component.html',
  styleUrls: ['./knowledge-source-drag-and-drop-list.component.css']
})
export class KnowledgeSourceDragAndDropListComponent implements OnInit, OnChanges, AfterViewInit {
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

  ngAfterViewInit() {
  }


  removeKs(ks: KnowledgeSource) {
    if (this.ksWarnOnDelete) {
      this.dialogService.openWarnDeleteKs(ks).then((confirmed) => {
        if (confirmed) {
          this.ksList = this.ksList.filter(k => k.id.value !== ks.id.value);
          this.ksListChanged.emit(this.ksList);
        }
      })
    } else {
      this.ksList = this.ksList.filter(k => k.id.value !== ks.id.value);
      this.ksListChanged.emit(this.ksList);
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
