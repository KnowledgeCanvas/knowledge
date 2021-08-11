import {Component, Inject, OnInit} from '@angular/core';
import {ProjectCreationRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-project-creation-dialog',
    templateUrl: './project-creation-dialog.component.html',
    styleUrls: ['./project-creation-dialog.component.scss']
})

export class ProjectCreationDialogComponent implements OnInit {
    public project: ProjectCreationRequest;

    constructor(private projectService: ProjectService,
                public dialogRef: MatDialogRef<ProjectCreationDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: string) {
        this.project = {
            name: ''
        };
    }

    ngOnInit(): void {
        this.init();
    }

    create(): void {
        if (this.project?.name) {
          console.log('Creating new project: ', this.project);
          this.projectService.newProject(this.project);
          this.projectService.refreshTree();
          this.dialogRef.close();
            // this.projectService.newProject(this.project).subscribe(result => {
            //     this.projectService.refreshTree();
            //     this.dialogRef.close(result);
            // }, error => {
            //     console.error('ProjectCreationDialog: Failed to create project with CreationRequest: ', this.project);
            // });
        }
    }

    dismiss(): void {
        this.dialogRef.close();
    }

    init(): void {
        this.project = {
            name: ''
        };

        if (this.data) {
            this.project.parentId = this.data;
        }
    }

}
