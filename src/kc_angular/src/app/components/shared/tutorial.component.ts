import {Component, OnInit} from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";

type TutorialState = {
  title: string,
  body: string,
  html?: string,
  image?: any,
  imagePos?: 'left' | 'right',
  imageHeight?: number,
  index: number
}

@Component({
  selector: 'app-tutorial',
  template: `
    <div class="w-full h-full flex-col-center-between select-none">
      <div class="tutorial-header w-full flex flex-row justify-content-between pt-4">
        <b class="text-lg">{{state.title}}</b>
        <div>
          <div class="pi pi-times cursor-pointer" (click)="close()"></div>
        </div>
      </div>
      <div class="tutorial-content w-full flex flex-row flex-grow-1 my-3 justify-content-between"
           [class.flex-row-reverse]="state.imagePos && state.imagePos === 'right'"
           style="min-height: 8rem">
        <div class="tutorial-image flex flex-column flex-shrink-1">
          <img *ngIf="state.image" [src]="state.image" [height]="state.imageHeight" class="border-round"/>
        </div>
        <div class="tutorial-body flex flex-column flex-grow-1 h-full w-full text-lg">
          <div *ngIf="state.html" style="max-width: 64rem" [innerHtml]="state.html"></div>
        </div>
      </div>
      <div class="tutorial-footer w-full flex flex-row flex-shrink-1 justify-content-between" style="min-width: 32rem">
        <p-checkbox [(ngModel)]="showAgain" [binary]="true" label="Show on startup"></p-checkbox>
        <div class="flex flex-row">
          <button pButton [disabled]="state.index === 0" label="Previous" class="p-button-text" (click)="prev()"></button>
          <button pButton *ngIf="state.index < states.length - 1" label="Next" class="p-button-text" (click)="next()"></button>
          <button pButton *ngIf="state.index === states.length - 1" label="Close" class="p-button-danger p-button-text" (click)="close()"></button>
        </div>
      </div>
    </div>
  `
})
export class TutorialComponent implements OnInit {
  showAgain: boolean = true;

  states: TutorialState[] = [
    {
      title: 'Welcome to Knowledge!',
      body: '',
      html: `
      <div>
        <div>
          This tutorial will walk you through some of the basics and help you get started with <code class="text-primary">Knowledge</code>.
          You can click the <div class="pi pi-times"></div> button at the top of this window to skip the tutorial at any time.
        </div>
      </div>
      `,
      image: undefined,
      index: 0
    },
    {
      title: 'Projects',
      body: '',
      html: `
        <div>
            <div class="mx-5">
            <h3>About</h3>
                <p>
                  Without getting too fancy, <code class="text-primary">Knowledge</code> is based on the idea that
                  we process and store information in a structured and hierarchical manner, both in our brains and on our digital devices.
                  For instance, there is a good chance that you implicitly understand the structure laid out in the image on the right.
                  It is very similar to the ways in which you store files and folders on your computer, Google Drive, etc..
                </p>
                <p>
                  This structure represents the <code class="text-primary">Knowledge</code> application, as seen from the perspective of its creators.
                  At the top of the image is the <quote>root</quote> <b><code class="text-primary">Project</code></b> labeled <code>Knowledge</code>.
                  This project has various Sub-Projects, which are labeled <code>Dependencies</code>, <code>Knowledge Sources</code>, <code>etc.</code>
                  Every Project in <code class="text-primary">Knowledge</code> may contain any number of Sub-Projects,
                  meaning there are a virtually unlimited number of ways in which you can structure your Projects.
                </p>
                <h3>Next Steps</h3>
                <p>
                    Once you are done with this tutorial, click the <br><b>+ Project</b> button to create your first project.
                </p>
            </div>
        </div>
      `,
      image: 'https://user-images.githubusercontent.com/19367848/179429544-03c51975-2d33-4048-b05f-febc6db62b38.png',
      imageHeight: 420,
      imagePos: 'right',
      index: 1
    },
    {
      title: 'Sources',
      body: '',
      html: `
      <div class="mx-3">
      <h3>About</h3>
        <p>
            <code class="text-primary">Knowledge</code> allows you to import and store various digital resources into your Projects, including PDFs, presentations, images, videos, documents, weblinks, and more.
            We refer to these resources as <code class="text-primary">Knowledge Sources</code> or simply <b><code class="text-primary">Sources</code></b>.
        </p>

        <p>
            There are numerous ways to import Sources:
            <ul>
                <li>Click <b>+File</b> or <b>+Link</b> on the Inbox page</li>
                <li>Drag and drop files or links directly into <code class="text-primary">Knowledge</code></li>
                <li>Download the <code class="text-primary">Knowledge</code> Chrome extension</li>
                <li>Save a file to a specific directory and <code class="text-primary">Knowledge</code> will automatically import it for you</li>
                <li>Use the built-in browser and click the <code>Save</code> button</li>
            </ul>
            For more information on the various import options and how to enable them, visit the <a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Basics#sources">Knowledge Wiki</a>
        </p>
        <h3>Next Steps</h3>
        <p>After importing sources, click the following icons on the navigation bar to explore</p>
        <ul>
            <li><div class="pi pi-table"></div> Table</li>
            <li><div class="pi pi-th-large"></div> Grid</li>
            <li><div class="pi pi-calendar"></div> Calendar</li>
        </ul>
      </div>
      `,
      index: 2
    },
    {
      title: 'Inbox',
      body: '',
      html: `
        <div class="pi pi-inbox"></div>
        <p>
            No matter how you import sources into <code class="text-primary">Knowledge</code>, they will always appear in your Inbox first.
            From there, you can:
        </p>
        <ul>
          <li>View and change details like title and description</li>
          <li>Preview PDFs and YouTube videos</li>
          <li>Add topics</li>
          <li>Set a due date</li>
          <li>Assign Sources to Projects</li>
        </ul>
      `,
      index: 3
    },
    {
      title: 'Getting around',
      body: '',
      html: `
      <div class="ml-4 h-full">
        Navigation is easy using the bar on the left-hand side, but even easier using shortcut keys:
        <ul>
        <li>
          <code>⌘/ctrl + 1</code>: Switch to <code>Inbox</code> view</li>
          <li>
          <code>⌘/ctrl + 2</code>: Switch to <code>Project</code> view</li>
          <li>
          <code>⌘/ctrl + 3</code>: Switch to <code>Table</code> view</li>
          <li>
          <code>⌘/ctrl + 4</code>: Switch to <code>Grid</code> view</li>
          <li>
          <code>⌘/ctrl + 5</code>: Switch to <code>Calendar</code> view</li>
        </ul>

        <div>You can see a complete list of Shortcut Keys in the <a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Knowledge Wiki</a></div>
      </div>
      `,
      image: 'https://user-images.githubusercontent.com/19367848/179428756-30a93365-f5ce-42ec-b405-41785fc26195.png',
      imageHeight: 192,
      imagePos: 'left',
      index: 4
    },
    {
      title: 'Learn More',
      body: '',
      html: `
      Visit the Knowledge Wiki to find out more:
      <ul>
        <li><a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Basics">Basics</a></li>
        <li><a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Shortcut-Keys">Shortcut Keys</a></li>
        <li><a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Development">Development</a></li>
        <li><a target="_blank" href="https://github.com/KnowledgeCanvas/knowledge/wiki/Debugging">Debugging</a></li>
      </ul>
      `,
      index: 5
    }
  ]

  state: TutorialState = this.states[0];

  // TODO: finish tutorial

  constructor(private ref: DynamicDialogRef) {
  }

  ngOnInit(): void {
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
