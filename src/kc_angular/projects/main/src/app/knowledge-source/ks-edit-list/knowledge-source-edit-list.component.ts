import {Component, OnInit} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {
  KcDialogRequest,
  KcDialogService
} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";

interface KsChecklist {
  title: string;
  checked: boolean;
  id: string;
  type: IngestType
}

@Component({
  selector: 'app-knowledge-source-view',
  templateUrl: './knowledge-source-edit-list.component.html',
  styleUrls: ['./knowledge-source-edit-list.component.scss']
})
export class KnowledgeSourceEditListComponent implements OnInit {
  checklist: KsChecklist[] = [];
  project: ProjectModel | null = new ProjectModel('', {value: ''});
  knowledgeSource: KnowledgeSource[] = [];
  allComplete: boolean = false;
  someSelected: boolean = false;

  constructor(private projectService: ProjectService, private dialogService: KcDialogService) {
    this.projectService.currentProject.subscribe(project => {
      if (project?.name && project?.id.value !== '') {
        this.project = project;

        if (project.knowledgeSource && project.knowledgeSource.length > 0) {
          this.knowledgeSource = project.knowledgeSource;
          this.checklist = [];



          for (let ks of project.knowledgeSource) {
            let ksCheck: KsChecklist = {
              title: ks.title,
              checked: false,
              id: ks.id.value,
              type: ks.ingestType
            }
            this.checklist.push(ksCheck);
          }
        } else {
          this.knowledgeSource = [];
          this.checklist = [];
        }
      } else {
        this.project = null;
        this.knowledgeSource = [];
        this.checklist = [];
      }
    });
  }

  ngOnInit(): void {
  }

  setAll(checked: boolean) {
    this.allComplete = checked;
    this.someSelected = checked;
    if (this.checklist.length > 0) {
      this.checklist.forEach(c => c.checked = checked);
    }
  }

  updateAllComplete() {
    this.allComplete = this.checklist != null && this.checklist.every(t => t.checked);
    this.someSelected = this.checklist != null && this.checklist.some(t => t.checked);
    if (this.someSelected) {

    }
  }

  clickDelete() {
    let selected = this.checklist.filter(ks => ks.checked);

    if (selected.length === 0)
      return;

    let title = selected.length > 1 ? `Delete ${selected.length} Knowledge Sources?` : 'Delete 1 Knowledge Source?'

    const options: KcDialogRequest = {
      title: title,
      message: 'You will not be able to recover knowledge sources once they are deleted. All information and' +
        ' associated data will be unrecoverable. Continue?',
      cancelButtonText: 'Cancel',
      actionButtonText: 'Delete Permanently',
      actionToTake: 'delete',
      listToDisplay: selected
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        let removeKnowledgeSource: KnowledgeSource[] = [];
        for (let select of selected) {
          let ks = this.knowledgeSource.find(ks => ks.id.value === select.id);
          if (ks) removeKnowledgeSource.push(ks);
        }

        if (this.project) {
          let update: ProjectUpdateRequest = {
            id: this.project.id,
            removeKnowledgeSource: removeKnowledgeSource
          }
          this.projectService.updateProject(update);
          this.someSelected = false;
        }
      }
    }, error => {
      console.error(error);
    });
  }

  clickEdit() {
    let selected = this.checklist.filter(ks => ks.checked);
    // TODO: implement a way to mass-edit KS
    console.warn('Not implemented... selected: ', selected);
  }

  iconFromIngestType(type: IngestType): string {
    switch (type) {
      case "topic":
        return 'topic';
      case "website":
        return 'web';
      case "search":
        return 'web';
      case "file":
        return 'description';
      case "google":
        return 'travel_explore';
      default:
        return '';
    }
  }

  openKs(ks: KsChecklist) {
    console.log('Opening ks: ', ks);
  }
}
