import { Pipe, PipeTransform } from '@angular/core';
import {ProjectIdentifiers} from "../services/projects/project.service";

@Pipe({
  name: 'projectBreadcrumb'
})
export class ProjectBreadcrumbPipe implements PipeTransform {

  transform(ancestors: ProjectIdentifiers[]): string {
    if (ancestors.length === 0)
      return '';

    let ret = `<button routerLink="/" routerLinkActive="active">${ancestors[0].title}</button>`;

    for (let i = 1; i < ancestors.length; i++) {
      ret += ` > <button routerLink="/" routerLinkActive="active">${ancestors[i].title}</button>`;
    }

    return ret;
  }

}
