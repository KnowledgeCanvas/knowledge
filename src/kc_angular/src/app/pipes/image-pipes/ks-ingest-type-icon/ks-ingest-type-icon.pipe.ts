import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ksIngestTypeIcon'
})
export class KsIngestTypeIconPipe implements PipeTransform {

  transform(type: string): string {
    switch (type) {
      case "topic":
        return 'sitemap';
      case "website":
        return 'link';
      case "search":
        return 'search';
      case "file":
        return 'file';
      case "google":
        return 'google';
      default:
        return '';
    }
  }

}
