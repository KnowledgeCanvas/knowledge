import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'searchThreshold'
})
export class SearchThresholdPipe implements PipeTransform {

  transform(threshold: number): string {
    threshold = threshold / 100;
    if (threshold == 0) {
      return '0 (perfect match)'
    } else if (threshold < 1) {
      return `${threshold}`;
    } else {
      return '1 (match anything)'
    }
  }

}
