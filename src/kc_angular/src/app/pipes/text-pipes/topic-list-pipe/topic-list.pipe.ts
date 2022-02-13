import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'topicList'
})
export class TopicListPipe implements PipeTransform {

  transform(topics: string[], ...args: unknown[]): unknown {
    return topics.map((t) => t.trim()).join(', ');
  }

}
