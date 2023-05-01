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
  }

  public parseMarkdown(markdown: string): string {
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
            `<a target="_blank" class="text-primary" rel="noreferrer noopener nofollow" `
          );
    };
  }
}
