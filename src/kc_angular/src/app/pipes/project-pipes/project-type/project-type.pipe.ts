import {Pipe, PipeTransform} from '@angular/core';
import {ProjectType} from "../../../models/project.model";
import {ProjectService} from "../../../services/factory-services/project-service/project.service";

@Pipe({
  name: 'projectType'
})
export class ProjectTypePipe implements PipeTransform {
  constructor(private projectService: ProjectService) {
  }

  transform(type: ProjectType): string {
    if (!type) {
      return 'Default';
    } else {
      return this.projectService.ProjectTypes.find(t => t.code === type)?.name ?? 'Default';
    }
  }

}
