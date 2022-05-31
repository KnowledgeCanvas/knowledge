/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KcProject} from "../../../models/project.model";
import {UUID} from "../../../models/uuid.model";

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {
  /**
   * The project to be displayed on this card.
   */
  @Input() kcProject!: KcProject;

  /**
   * Whether to display the "Archive Project" button.
   * Default is false.
   */
  @Input() showArchive: boolean = false;

  /**
   * Whether to display the "Remove Project" button.
   * Default is true.
   */
  @Input() showRemove: boolean = true;

  /**
   * Whether to display the "Edit Project" button.
   * Default is true.
   */
  @Input() showEdit: boolean = true;

  /**
   * Whether to display the "Add Subproject" button.
   * Default is true.
   */
  @Input() showAddSubproject: boolean = true;

  /**
   * Whether to display the "GoTo Project" button.
   * Default is true.
   */
  @Input() showNavigate: boolean = true;

  /**
   * Whether to display the "GoTo Project" button for subprojects.
   * Default is true.
   */
  @Input() showSubprojectNavigate: boolean = true;

  /**
   * Emitted when the "edit" button is pressed.
   * Contains the ID of the project to be edited.
   */
  @Output() onEditProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "GoTo" button is pressed.
   * Contains the ID of the project to be navigated to.
   */
  @Output() onNavigateToProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Add Subproject" button is pressed.
   * Contains the ID of the parent project.
   */
  @Output() onAddSubproject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Remove Project" button is pressed.
   * Contains the ID of the project to be removed.
   */
  @Output() onRemoveProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Archive Project" button is pressed.
   * Contains the ID of the project to be archived.
   */
  @Output() onArchiveProject = new EventEmitter<UUID>();


  constructor() {
  }

  ngOnInit(): void {
  }

  /**
   * Convenience method that transforms a project ID string to UuidModel
   * @param id
   */
  navigate(id: string) {
    this.onNavigateToProject.emit(new UUID(id));
  }
}
