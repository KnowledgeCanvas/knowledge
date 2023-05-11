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

import { Injectable } from '@angular/core';
import { marked, Renderer } from 'marked';
import { NotificationsService } from '@services/user-services/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  renderer: Renderer;

  constructor(private notify: NotificationsService) {
    this.renderer = new marked.Renderer();
    this.configureLinks();
    this.configureParagraphs();
  }

  public parseMarkdown(markdown: string, topics?: string[]): string {
    if (topics) {
      // First, make sure that the topics are unique.
      // If a topic is a substring of another topic, use the longer one
      // e.g. ['foo', 'foobar'] => ['foobar']
      topics = topics?.map((t) => t.trim());
      const subset = topics
        ?.map((t) => t.trim())
        .filter((t) => !topics?.some((t2) => t2 !== t && t2.includes(t)));

      // For all topics, scan the markdown for the topic and wrap it in a PrimeNG tag with the topic as the label. Make sure to ignore case.
      subset.forEach((topic) => {
        // Replace each occurance of the topic with a tag. This should account for word breaks, white space, and punctuation.
        markdown = markdown.replace(
          new RegExp(`${topic.trim()}`, 'gi'),
          `**${topic}**`
        );
      });
    }

    let html;
    try {
      html = marked(markdown, { renderer: this.renderer });
    } catch (e) {
      this.notify.error('Markdown Service', 'Parse Error', markdown);
    }
    return html ?? markdown;
  }

  private configureLinks() {
    /**
     * Required to ensure links open in local browser instead of redirecting inside the Electron window.
     */
    const linkRenderer = this.renderer.link;
    this.renderer.link = (href, title, text) => {
      const localLink = href?.startsWith(
        `${location.protocol}//${location.hostname}`
      );
      const html = linkRenderer.call(this.renderer, href, title, text);
      return localLink
        ? html
        : html.replace(
            /^<a /,
            `<a target="_blank" class="font-bold text-color-secondary" rel="noreferrer noopener nofollow" `
          );
    };
  }

  private configureParagraphs() {
    /**
     * Add 0.5rem of padding to the top and bottom of paragraphs.
     */
    const paragraphRenderer = this.renderer.paragraph;
    this.renderer.paragraph = (text) => {
      const html = paragraphRenderer.call(this.renderer, text);
      return html.replace(/^<p>/, `<p class="p-1">`);
    };
  }
}
