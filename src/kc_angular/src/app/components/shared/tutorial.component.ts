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

import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

type TutorialState = {
  title: string;
  body: string;
  html?: string;
  image?: any;
  imagePos?: 'left' | 'right';
  imageHeight?: number;
  index: number;
};

@Component({
  selector: 'app-tutorial',
  template: `
    <div class="w-full h-full flex-col-center-between">
      <div
        class="tutorial-header w-full flex flex-row justify-content-between pt-4"
      >
        <b class="text-lg">{{ state.title }}</b>
        <div>
          <div class="pi pi-times cursor-pointer" (click)="close()"></div>
        </div>
      </div>
      <div
        class="tutorial-content w-full flex flex-row flex-grow-1 my-3 justify-content-between"
        [class.flex-row-reverse]="state.imagePos && state.imagePos === 'right'"
        style="min-height: 8rem"
      >
        <div class="tutorial-image flex flex-column flex-shrink-1">
          <img
            *ngIf="state.image"
            [src]="state.image"
            [height]="state.imageHeight"
            class="border-round"
            alt="Tutorial Image"
          />
        </div>
        <div
          class="tutorial-body flex flex-column flex-grow-1 h-full w-full text-lg"
        >
          <div
            *ngIf="state.html"
            style="max-width: 64rem"
            [innerHtml]="state.html"
          ></div>
        </div>
      </div>
      <div
        class="tutorial-footer w-full flex flex-row flex-shrink-1 justify-content-between"
        style="min-width: 32rem"
      >
        <p-checkbox
          [(ngModel)]="showAgain"
          [binary]="true"
          label="Show on startup"
        ></p-checkbox>
        <div class="flex flex-row">
          <button
            pButton
            [disabled]="state.index === 0"
            label="Previous"
            class="p-button-text"
            (click)="prev()"
          ></button>
          <button
            pButton
            *ngIf="state.index < states.length - 1"
            label="Next"
            class="p-button-text"
            (click)="next()"
          ></button>
          <button
            pButton
            *ngIf="state.index === states.length - 1"
            label="Close"
            class="p-button-danger p-button-text"
            (click)="close()"
          ></button>
        </div>
      </div>
    </div>
  `,
})
export class TutorialComponent {
  showAgain = true;

  states: TutorialState[] = [
    {
      title: 'Welcome to Knowledge!',
      body: '',
      html: `
      <div>
        <div>
            This tutorial will cover the basics and help you get started with <b class="text-primary">Knowledge</b>.
        </div>
        <br>
        <div>
            <b class="text-primary">Knowledge</b> is the ultimate information management system. With <b class="text-primary">Knowledge</b>, you can store and access all your digital resources, including PDFs, images, videos, documents, webpages, and more. <b class="text-primary">Knowledge</b> allows you to take control of your digital workflow by bringing structure to your resources. Let's get started!
        </div>
        <br>
        <div>
            Click <span class="text-primary">Next</span> to learn more.
        </div>
      </div>
      `,
      image: undefined,
      index: -1,
    },
    {
      title: 'Sources',
      body: '',
      html: `
      <div class="mx-3">
      <h3>About</h3>
        <p>
            In Knowledge, Sources are the foundation of information that users interact with, store, read, and access. They come in various formats, such as local files, websites, YouTube videos, and more.
        </p>
        <p>
            There are numerous ways to import Sources:
            <ul>
                <li>Click the <span class="text-primary">+<div class="pi pi-file"></div></span> or <span class="text-primary">+<div class="pi pi-link"></div></span> buttons on the top bar</li>
                <li>Drag and drop files or links directly into this window</li>
                <li>Use the built-in browser and click the Save button</li>
                <li>Download our Chrome browser extension (<span class="text-primary"><div class="pi pi-cog"></div> Settings > Import > Extensions</span>)</li>
                <li>Enable Autoscan to monitor a local folder for new files (<span class="text-primary"><div class="pi pi-cog"></div> Settings > Import > Autoscan</span>)</li>
            </ul>
            For more information on Sources, their metadata, topics, and more, visit the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Sources">Knowledge Wiki</a>
        </p>
        <h3>Next steps</h3>
        <p>After importing Sources, click the following icons on the navigation bar to explore Sources in various views</p>
        <ul>
            <li><span class="text-primary"><span class="pi pi-sitemap"></span> Graph</span></li>
            <li><span class="text-primary"><span class="pi pi-table"></span> Table</span></li>
            <li><span class="text-primary"><span class="pi pi-th-large"></span> Grid</span></li>
            <li><span class="text-primary"><span class="pi pi-calendar"></span> Calendar</span></li>
            <li><span class="text-primary"><span class="pi pi-comments"></span> Chat</span></li>
        </ul>
      </div>
      `,
      index: -1,
    },
    {
      title: 'Project and Subprojects',
      body: '',
      html: `
        <div>
            <div class="mx-5">
            <h3>About</h3>
                <p>
                    Projects and Subprojects are the primary organizational structures in Knowledge, designed to help users categorize and manage their Sources effectively. Projects can be thought of as containers that hold Sources and can be further divided into Subprojects, creating a hierarchy that enables users to break down complex concepts into smaller, more manageable parts.
                </p>
                <p>
                  Subprojects are nested within their parent Projects and can have their own Subprojects, allowing users to create a multi-level hierarchy tailored to their specific needs.
                </p>
                <p>
                    <div class="text-primary">Pro Tip</div>
                    The <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree is a great way to navigate between Projects. You can click on the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> button at the bottom of the window to toggle the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree sidebar.
                </p>
                <h3>Next steps</h3>
                <p>
                    Once you are done with this tutorial, click the <span class="text-primary">+<span class="pi pi-folder"></span></span> button on the top bar to create a new Project. You can also right-click on a Project inside the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree to create a Subproject.
                </p>
                <p>
                    Learn more about Projects by visiting the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Projects-and-Subprojects">Knowledge Wiki</a>
                </p>
            </div>
        </div>
      `,
      index: -1,
    },
    {
      title: 'Chat',
      body: '',
      html: `
      <div>
            <div class="mx-5">
                <h3>About</h3>
                <p>
                  The Chat feature allows users to communicate with agents representing their Sources and Projects. These agents facilitate learning by providing valuable insights and recommendations. The Chat feature is accessible in two ways:
                  <ul>
                      <li><b>Chat View:</b> Offers a centralized location for all individual chats with Sources and the active Project.</li>
                      <li><b>Source Chat:</b> Accessible through the Source details page, allowing users to chat with a specific Source.</li>
                  </ul>
                </p>
                <p>
                    <div class="text-primary">Pro Tip</div>
                    Right-click on a chat message to perform various actions:
                    <ul>
                      <li><span class="text-primary"><span class="pi pi-arrow-right"></span> Continue:</span> Produce additional output after the original message (useful for incomplete responses).</li>
                      <li><span class="text-primary"><span class="pi pi-refresh"></span> Regenerate:</span> Recreate the message if you aren't happy with the results.</li>
                      <li><span class="text-primary"><span class="pi pi-book"></span> TLDR:</span> Shorten the message and make it more succinct. (too long, didn't read)</li>
                      <li><span class="text-primary"><span class="pi pi-info-circle"></span> ELI5:</span> Make the message more understandable using simpler analogies and vocabulary. (explain like I'm 5)</li>
                    </ul>
                    You can also highlight the text of a message and right-click to perform additional actions, like <mark>highlighting text</mark> and adding new topics.
                </p>
                <p>
                Finally, you can give a message a thumbs up or thumbs down by clicking the <span class="text-primary"><span class="pi pi-thumbs-up"></span></span> or <span class="text-primary"><span class="pi pi-thumbs-down"></span></span> buttons. This will help improve chat responses by removing or emphasizing different messages from the context window.
</p>
                <h3>Next steps</h3>
                <p>In order to use the Chat feature, click on the <span class="text-primary"><span class="pi pi-comments"></span> Chat View</span> button after creating your first Project. You will be prompted to enter your Open AI API Key. Your API Key will then be encrypted and saved locally on your computer.</p>
                <p>
                    Learn more about the Chat feature and how to register an API key by visiting the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Project-Inheritance">Knowledge Wiki - Chat</a> page
                </p>
            </div>
        </div>
      `,
      index: -1,
    },
    {
      title: 'Inbox',
      body: '',
      html: `
        <p>
            No matter how you import Sources into <b class="text-primary">Knowledge</b>, they will always appear in your <span class="text-primary"><span class="pi pi-inbox"></span> Inbox</span> first.
            From there, you can:
        </p>
        <ul>
          <li>Assign Sources to Projects</li>
          <li>Add topics</li>
          <li>Set a due date</li>
          <li>Preview PDFs and YouTube videos</li>
          <li>View and change details, like the title and description</li>
        </ul>

        <h3>Hint:</h3>
                <p>
                    Try right-clicking on Sources for a list of actions (e.g. preview, show in files, copy links, etc.)
                </p>
      `,
      index: -1,
    },
    {
      title: 'Getting around',
      body: '',
      html: `
      <div class="ml-4 h-full">
        Navigation is easy using the bar on the left-hand side, but even easier using shortcut keys:
        <ul>
          <li><code>⌘/ctrl + 1</code>: Switch to <span class="text-primary"><span class="pi pi-inbox"></span> Inbox</span></li>
          <li><code>⌘/ctrl + 2</code>: Switch to <span class="text-primary"><span class="pi pi-list"></span> Projects</span></li>
          <li><code>⌘/ctrl + 3</code>: Switch to <span class="text-primary"><span class="pi pi-sitemap"></span> Graph</span></li>
          <li><code>⌘/ctrl + 4</code>: Switch to <span class="text-primary"><span class="pi pi-table"></span> Table</span></li>
          <li><code>⌘/ctrl + 5</code>: Switch to <span class="text-primary"><span class="pi pi-th-large"></span> Grid</span></li>
          <li><code>⌘/ctrl + 6</code>: Switch to <span class="text-primary"><span class="pi pi-calendar"></span> Calendar</span></li>
          <li><code>⌘/ctrl + 7</code>: Switch to <span class="text-primary"><span class="pi pi-comments"></span> Chat</span></li>
        </ul>

        <div>You can see a complete list of Shortcut Keys in the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Knowledge Wiki</a></div>
      </div>
      `,
      index: -1,
    },
    {
      title: 'Project Inheritance',
      body: '',
      html: `
      <div>
            <div class="mx-5">
                <h3>About</h3>
                <p>
                  Project Inheritance is a powerful feature in Knowledge that allows higher-level Projects to inherit the Sources of all their descendant Projects and Subprojects. When a Project is active, its Sources and the Sources of all its Subprojects become visible and accessible.
                  This feature streamlines the organization and navigation process by enabling users to view and interact with all relevant Sources in one place, without having to go through multiple Subprojects individually.
                </p>
                <p>
                    Learn more about Project Inheritance by visiting the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Project-Inheritance">Knowledge Wiki</a>
                </p>
                <p>
                    <div class="text-primary">Pro Tip</div>
                    The footer will always show you where you are in the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree, starting from the top-level Project. You can click on any of the Projects in the footer to navigate to that Project.
                </p>
            </div>
        </div>
      `,
      index: -1,
    },
    {
      title: 'Learn more',
      body: '',
      html: `
      Visit the Knowledge Wiki for more on:
      <ul>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki">Introduction</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Shortcut Keys</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Development">Development</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Debugging">Debugging</a></li>
      </ul>
      `,
      index: -1,
    },
  ];

  state: TutorialState = this.states[0];

  constructor(private ref: DynamicDialogRef) {
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].index = i;
    }
  }

  close() {
    this.ref.close(this.showAgain);
  }

  next() {
    this.state = this.states[this.state.index + 1];
  }

  prev() {
    this.state = this.states[this.state.index - 1];
  }
}
