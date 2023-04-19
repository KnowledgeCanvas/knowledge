/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ProjectService } from '@services/factory-services/project.service';
import { UUID } from '@shared/models/uuid.model';

@Pipe({
  name: 'projectBreadcrumb',
})
export class ProjectBreadcrumbPipe implements PipeTransform {
  constructor(private projectService: ProjectService) {}

  transform(id: UUID | string, ...args: unknown[]): string {
    if (typeof id === 'string') {
      id = { value: id };
    }

    const ancestors = this.projectService.getAncestors(id.value);
    if (!ancestors) {
      return '';
    }

    let start, end, prefix;

    const SEP = '>';
    const ELLIPSIS = '...';

    if (args && args.length > 0 && args[0] && args[0] == 'no-truncate') {
      start = 0;
      end = ancestors.length;
      prefix = '';
    } else {
      start = Math.max(0, ancestors.length - 3);
      end = ancestors.length;

      if (args && args.length > 0 && args[0] && args[0] == 'no-ellipse') {
        prefix = '';
      } else {
        prefix =
          start > 0
            ? `${ancestors[0].title} ${SEP} ${start > 1 ? ELLIPSIS : ''} ${
                start > 1 ? SEP : ''
              } `
            : '';
      }
    }

    return (
      prefix +
      ancestors
        .slice(start, end)
        .map((a) => a.title)
        .join(` ${SEP} `)
    );
  }
}
