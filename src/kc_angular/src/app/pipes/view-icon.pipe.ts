/*
 * Copyright (c) 2022-2023 Rob Royce
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

@Pipe({
  name: 'viewIcon',
})
export class ViewIconPipe implements PipeTransform {
  transform(viewLabel: string): string {
    switch (viewLabel) {
      case 'inbox':
        return 'pi pi-inbox';
      case 'projects':
        return 'pi pi-list';
      case 'chat':
        return 'pi pi-comments';
      case 'table':
        return 'pi pi-table';
      case 'grid':
        return 'pi pi-th-large';
      case 'graph':
        return 'pi pi-sitemap';
      case 'calendar':
        return 'pi pi-calendar';
      default:
        return '';
    }
  }
}
