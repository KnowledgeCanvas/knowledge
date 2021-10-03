/**
 Copyright 2021 Rob Royce

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
