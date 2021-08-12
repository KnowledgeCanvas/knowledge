import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatChipInputEvent} from "@angular/material/chips";

export interface ProjectTags {
  name: string;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailComponent implements OnInit {
  @Input() projectId: string | null = '';
  project: ProjectModel | null = {};
  isExpanded = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectable = true;
  removable = true;
  topics?: string[] = [];
  searchHidden: boolean = true;


  constructor(private projectService: ProjectService, private snackBar: MatSnackBar) {
    this.reset();
  }

  reset(): void {
      this.topics = [];
      this.project = null;

      this.projectService.currentProject.subscribe(project => {
          if (project?.name && project?.id !== '') {
              this.project = project;
              this.topics = project.topics;
          } else {
              this.project = null;
          }
      });
  }

  // addTag(event: MatChipInputEvent): void {
  //     const input = event.input;
  //     const value = event.value;
  //
  //     if ((value || '').trim()) {
  //         this.topics?.push(value.trim());
  //     }
  //
  //     if (input) {
  //         input.value = '';
  //     }
  //     this.updateProject();
  // }
  //
  // removeTag(tag: string): void {
  //     const index = this.topics?.indexOf(tag);
  //     if (index && index >= 0) {
  //         this.topics?.splice(index, 1);
  //     }
  //
  //     this.updateProject();
  // }

  // updateProject(): void {
  //     const payload: ProjectUpdateRequest = {
  //         authors: this.project?.authors,
  //         description: this.project?.description,
  //         id: this.project?.id ? this.project.id : '0',
  //         name: this.project?.name,
  //         topics: this.project?.topics
  //     };
  //     this.projectService.updateProject(payload).subscribe(project => {
  //     }, error => {
  //         console.error('Error on project update attempt: ', error);
  //     });
  // }

  ngOnInit(): void {
  }


  clickDetails(): void {
      this.isExpanded = !this.isExpanded;
  }

  // openSnackBar(message: string, action: string): void {
  //     this.snackBar.open(message, action, {
  //         duration: 2000
  //     });
  // }

  // private getExportPath(): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //         this.ipcService.send('open-directory-dialog');
  //         this.ipcService.on('open-directory-dialog-reply', (event, response) => {
  //             if (response.error) {
  //                 reject(response.error);
  //             } else if (response.path) {
  //                 resolve(response.path);
  //             }
  //         });
  //     });
  // }

}
