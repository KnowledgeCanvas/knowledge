import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countdown'
})
export class CountdownPipe implements PipeTransform {

  transform(value: Date, ...args: unknown[]): unknown {
    let then = new Date(value);
    let now = new Date();
    let diffTime = dateDiffInDays(then, now);
    let countdown = '';

    if (diffTime > 365) {
      countdown = `1yr+`;
    } else if (diffTime >= 90) {
      countdown = '90d+';
    } else {
      countdown = `${diffTime}d`;
    }

    return countdown;
  }
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a: any, b: any) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
