import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
    constructor() {
    }

    ngOnInit(): void {}

    // loadDetails(project: any): void {
    //     console.log('Load details: ', project);
    // }
}
