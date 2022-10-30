import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'viewIcon'
})
export class ViewIconPipe implements PipeTransform {

  transform(viewLabel: string): string {
    switch (viewLabel) {
      case 'inbox':
        return 'pi pi-inbox'
      case 'projects':
        return 'pi pi-list'
      case 'table':
        return 'pi pi-table'
      case 'grid':
        return 'pi pi-th-large'
      case 'graph':
        return 'pi pi-sitemap'
      case 'calendar':
        return 'pi pi-calendar'
      default:
        return ''
    }
  }
}
