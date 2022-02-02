import { Pipe, PipeTransform } from '@angular/core';
import {ProjectService} from "../../../services/factory-services/project-service/project.service";
import {UuidModel} from "../../../models/uuid.model";

@Pipe({
  name: 'projectName'
})
export class ProjectNamePipe implements PipeTransform {
  constructor(private projectService: ProjectService) {
  }

  transform(id: UuidModel | string): string {
    const pid: UuidModel = typeof id === 'string' ? new UuidModel(id) : id;

    if (!id) {
      return 'None'
    } else {
      return this.projectService.ProjectIdentifiers.find(p => p.id === pid.value)?.title ?? 'None';
    }
  }

}
