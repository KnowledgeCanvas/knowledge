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

import { MarkdownService } from '@services/factory-services/markdown.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  constructor(private markdownService: MarkdownService) {}

  transform(markdown: string, topics?: string[]): string {
    if (topics) {
      let md = this.markdownService.parseMarkdown(markdown) ?? markdown;
      // For all topics, scan the markdown for the topic and wrap it in a PrimeNG tag with the topic as the label. Make sure to ignore case.
      topics.forEach((topic) => {
        // Replace each occurance of the topic with a tag. This should account for
        // word breaks, white space, and punctuation.
        md = md.replace(
          new RegExp(`\\b${topic}\\b`, 'gi'),
          `<span class="topic-markdown">${topic}</span>`
        );
      });
      return md;
    } else {
      return this.markdownService.parseMarkdown(markdown) ?? markdown;
    }
  }
}
