import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'switchLabel'
})
export class SwitchLabelPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'Enabled' : 'Disabled';
  }

}
