/**
 Copyright 2022 Rob Royce

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

@Pipe({
  name: 'countdown'
})
export class CountdownPipe implements PipeTransform {

  transform(value: Date, ...args: unknown[]): unknown {
    let then = new Date(value);
    let now = new Date();
    let diffTime = dateDiffInDays(then, now);
    let countdown;
    if (diffTime > 365) {
      countdown = `1yr+`;
    } else if (diffTime >= 90) {
      countdown = '90d+';
    } else {
      countdown = `${Math.abs(diffTime)}d`;
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
