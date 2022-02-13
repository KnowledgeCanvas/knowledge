import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectModel} from "../../../models/project.model";
import {UuidModel} from "../../../models/uuid.model";

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {
  /**
   * The project to be displayed on this card
   */
  @Input() kcProject!: ProjectModel;

  /**
   * Emitted when the "edit" button is pressed
   * Contains the ID of the project to be edited
   */
  @Output() onEditProject = new EventEmitter<UuidModel>();

  /**
   * Emitted when the "GoTo" button is pressed
   * Contains the ID of the project to be navigated to
   */
  @Output() onNavigateToProject = new EventEmitter<UuidModel>();

  /**
   * Emitted when the "Add Subproject" button is pressed
   * Contains the ID of the parent project
   */
  @Output() onAddSubproject = new EventEmitter<UuidModel>();

  constructor() {
  }

  ngOnInit(): void {
  }

  /**
   * Convenience method that transforms a project ID string to UuidModel
   * @param id
   */
  navigate(id: string) {
    this.onNavigateToProject.emit(new UuidModel(id));
  }
}
