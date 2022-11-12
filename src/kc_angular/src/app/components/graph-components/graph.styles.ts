/**
 Copyright 2021 - 2022 Rob Royce

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

import {Stylesheet} from "cytoscape";

export class GraphStyles {
  constructor() {
  }

  get primary() {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
  }

  get textColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--text-color');
  }

  get textBackground() {
    return getComputedStyle(document.documentElement).getPropertyValue('--surface-a');
  }

  get primaryLight() {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-500');
  }

  get surfaceA() {
    return getComputedStyle(document.documentElement).getPropertyValue('--surface-a');
  }

  get styles(): Stylesheet[] | Promise<Stylesheet[]> | undefined {
    let levels: any[] = [];
    let colors = [
      '--primary-color',
      '--pink-500',
      '--green-500',
      '--blue-500',
      '--yellow-500',
      '--cyan-500'
    ]

    for (let i = 0; i < 16; i++) {
      let color: string = colors[i % colors.length]
      levels.push({
        selector: `node[level=${i + 1}]`,
        style: {
          'background-color': getComputedStyle(document.documentElement).getPropertyValue(color)
        }
      })
    }


    let nodeStyles: any[] = [
      {
        selector: 'edge',
        style: {
          'line-color': this.primary,
          'width': 1,
          'curve-style': 'haystack'
        }
      },
      {
        selector: 'node',
        style: {
          'content': 'data(label)',
          'text-valign': 'bottom',
          'text-halign': 'center',
          "text-wrap": "wrap",
          "text-max-width": '100px',
          width: 32,
          height: 32
        }
      },
      {
        selector: 'node[type="root"]',
        style: {
          width: 'data(width)',
          height: 'data(height)',
          'background-color': this.primary,
          "border-width": 1,
          "border-opacity": 0.7,
          shape: 'round-hexagon',
          'text-background-shape': 'roundrectangle',
          'color': this.textColor,
          'text-background-color': this.textBackground,
          'text-background-opacity': 0.65,
          'font-weight': 'bold',
          'font-size': '14px',
        }
      },
      {
        selector: 'node[type="project"]',
        style: {
          width: 'data(width)',
          height: 'data(height)',
          "background-width": '36px',
          "background-height": '36ppx',
          'background-color': this.primaryLight,
          "border-width": 1,
          "border-opacity": 0.7,
          shape: 'round-hexagon',
          'text-background-shape': 'roundrectangle',
          'color': this.textColor,
          'text-background-color': this.textBackground,
          'text-background-opacity': 0.3,
          'font-weight': 'bold',
          'font-size': '14px',
        }
      },
      {
        selector: 'node[type="ks"]',
        style: {
          "background-color": '#FFFFFF',
          width: 32,
          height: 32,
          "border-color": '#CACACA',
          "border-width": 2,
          "border-opacity": 0.8,
          'source-label': 'This is a source',
          'color': this.textColor,
          'text-background-color': this.textBackground,
          'text-background-shape': 'roundrectangle',
          'text-background-opacity': 0.65,
          "text-wrap": 'ellipsis',
          "text-max-width": '128px',
          'font-weight': 'normal',
          'font-size': '12px',
          ghost: 'yes',
          'ghost-opacity': 0.3,
          'ghost-offset-x': 1,
          'ghost-offset-y': 1,
          'background-image': 'data(ks.icon)'
        }
      },
      {
        selector: ':selected',
        style: {
          "border-width": 4,
          "border-color": this.primary
        }
      }
    ]

    return nodeStyles.concat(levels)
  }

}
