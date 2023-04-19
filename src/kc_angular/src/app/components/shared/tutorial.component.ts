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
            <b class="text-primary">Knowledge</b> is the ultimate information management system. With <b class="text-primary">Knowledge</b>, you can store and access all your digital resources, including PDFs, images, videos, documents, webpages, and more. <b class="text-primary">Knowledge</b> allows you to take control of your digital workflow by bringing structure to your digital resources. Let's get started!
        </div>
        <br>
        <div>
            Click <span class="text-primary">Next</span> to learn more.
        </div>
      </div>
      `,
      image: undefined,
      index: 0,
    },
    {
      title: 'Creating Your First Project',
      body: '',
      html: `
        <div>
            <div class="mx-5">
            <h3>About</h3>
                <p>
                    Projects help break down concepts into small and digestible pieces.
                    Think of it like organizing files on your computer. Just like you would group similar files into folders, you can group similar Sources into Projects.
                </p>
                <p>
                  In Knowledge, the hierarchical structure of Projects helps to create a better understanding of the topics you're learning.
                  This is important because the more organized your Sources are, the easier it is to find and understand them.
                </p>
                <p>
                    <div class="text-primary">Pro Tip #1</div>
                    The <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree is a great way to navigate between Projects. You can click on the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> button at the bottom of the window to toggle the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree sidebar.
                </p>
                <p>
                    <div class="text-primary">Pro Tip #2</div>
                    The footer will always show you where you are in the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree, starting from the top-level Project. You can click on any of the Projects in the footer to navigate to that Project.
                </p>
                <h3>Next steps</h3>
                <p>
                    Once you are done with this tutorial, click the <span class="text-primary">+<span class="pi pi-folder"></span></span> button on the top bar to create a new Project. You can also right-click on a Project inside the <span class="text-primary"><span class="pi pi-list"></span> Projects</span> Tree to create a Sub-Project.
                </p>
                <p>
                    Learn more about Projects by visiting the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Basics:-Projects">Knowledge Wiki</a>
                </p>
            </div>
        </div>
      `,
      index: 1,
    },
    {
      title: 'Sources',
      body: '',
      html: `
      <div class="mx-3">
      <h3>About</h3>
        <p>
            <b class="text-primary">Knowledge</b> allows you to import and store various digital resources, including PDFs, images, videos, documents, webpages, and more.
            We refer to these as <b class="text-primary">"Sources"</b>.
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
            For more information on the various import options and how to use them, visit the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Basics:-Sources">Knowledge Wiki</a>
        </p>
        <h3>Next steps</h3>
        <p>After importing Sources, click the following icons on the navigation bar to explore Sources in various views</p>
        <ul>
            <li><span class="text-primary"><span class="pi pi-table"></span> Table</span></li>
            <li><span class="text-primary"><span class="pi pi-th-large"></span> Grid</span></li>
            <li><span class="text-primary"><span class="pi pi-calendar"></span> Calendar</span></li>
        </ul>
      </div>
      `,
      index: 2,
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
      index: 3,
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
        </ul>

        <div>You can see a complete list of Shortcut Keys in the <a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Knowledge Wiki</a></div>
      </div>
      `,
      index: 4,
    },
    {
      title: 'Learn more',
      body: '',
      html: `
      Visit the Knowledge Wiki for more on:
      <ul>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Basics">Basics</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Shortcut Keys</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Development">Development</a></li>
        <li><a target="_blank" class="no-underline text-primary" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Debugging">Debugging</a></li>
      </ul>
      `,
      index: 5,
    },
  ];

  state: TutorialState = this.states[0];

  constructor(private ref: DynamicDialogRef) {}

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
