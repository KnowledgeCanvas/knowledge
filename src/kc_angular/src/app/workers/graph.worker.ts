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
/// <reference lib="dom" />

import { KcProject } from '../models/project.model';

export function createGraph(
  projects: (KcProject & { level: number })[],
  root: string,
  showSources: boolean
): any[] {
  const data: any[] = [];

  for (const project of projects) {
    data.push({
      group: 'nodes',
      data: {
        id: project.id.value,
        label: project.name,
        type: project.id.value === root ? 'root' : 'project',
        project: project,
        width: 64 / Math.pow(project.level, 1 / 2) + 4,
        height: 64 / Math.pow(project.level, 1 / 2),
        level: project.level,
      },
    });

    for (const sub of project.subprojects) {
      const edge = {
        group: 'edges',
        data: {
          id: `${project.id.value}-${sub}`,
          source: project.id.value,
          target: sub,
        },
      };
      data.push(edge);
    }

    if (showSources) {
      for (const ks of project.knowledgeSource) {
        data.push({
          group: 'nodes',
          data: {
            id: ks.id.value,
            label: ks.title,
            type: 'ks',
            ks: ks,
            icon: ks.icon,
          },
        });

        data.push({
          group: 'edges',
          data: {
            id: `${project.id.value}-${ks.id.value}`,
            source: project.id.value,
            target: ks.id.value,
          },
        });
      }
    }
  }
  return data;
}

addEventListener('message', (msg) => {
  if (!msg.data || !msg.data.projects || !msg.data.root) {
    return;
  }

  const projects: (KcProject & { level: number })[] = msg.data.projects;
  const root: string = msg.data.root;
  const showSources: boolean = msg.data.showSources;
  const data = createGraph(projects, root, showSources);
  postMessage(data);
});
