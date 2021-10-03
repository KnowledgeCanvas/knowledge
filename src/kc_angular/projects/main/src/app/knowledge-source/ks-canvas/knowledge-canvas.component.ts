import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {KsInfoDialogService} from "../../../../../ks-lib/src/lib/services/ks-info-dialog.service";

@Component({
  selector: 'app-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  kcProject: ProjectModel | null = null;

  @Input()
  searchBarVisible: boolean = false;

  @Output()
  ksRemoved = new EventEmitter<KnowledgeSource>();

  @Output()
  ksAdded = new EventEmitter<KnowledgeSource[]>();

  @Output()
  projectChanged = new EventEmitter<ProjectModel>();

  projectKsList: KnowledgeSource[] = [];

  projectKsListId = 'projectKsList';

  constructor(private ksDropService: KsDropService,
              private ksInfoDialog: KsInfoDialogService) {
    ksDropService.register({
      containerId: this.projectKsListId,
      receiveFrom: ['ksQueue'],
      sendTo: [],
      allowSort: true
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.kcProject) {
      this.projectKsList = changes.kcProject.currentValue.knowledgeSource;
    }
  }

  ngOnDestroy() {
    this.ksDropService.unregister(this.projectKsListId);
  }

  projectKsSelected($event: KnowledgeSource) {
    this.ksInfoDialog.open($event, this.kcProject?.id.value).then((ksInfoOutput) => {
    })
  }

  ksListChanged(ksList: KnowledgeSource[]) {
    if (this.kcProject) {
      this.projectKsList = ksList;
      this.kcProject.knowledgeSource = ksList;
      this.projectChanged.emit(this.kcProject);
    } else {
      this.projectKsList = [];
    }
  }

  ksListSorted(ksList: KnowledgeSource[]) {
    // TODO
  }
}
