import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-project-context',
  templateUrl: './project-context.component.html',
  styleUrls: ['./project-context.component.scss']
})

export class ProjectContextComponent implements OnInit {

  @Input() menuOptions: any;
  constructor() { }

  ngOnInit(): void {
  }
// Following https://medium.com/@asdivinity8/passing-data-to-angular-material-menu-485e38012c
}
