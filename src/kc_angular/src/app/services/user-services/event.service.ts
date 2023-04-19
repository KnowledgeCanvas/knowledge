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
import { KcProject } from '@app/models/project.model';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { ProjectCalendarEvent } from '@components/project-components/project-calendar.component';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  fromProject(project: KcProject) {
    const projectColor = 'yellow';
    const projectTextColor = 'black';
    return [
      {
        title: `"${project.name}" (Created)`,
        start: project.dateCreated,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project',
      },
      {
        title: `"${project.name}" (Modified)`,
        start: project.dateModified,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project',
      },
      {
        title: `"${project.name}" (Accessed)`,
        start: project.dateAccessed,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project',
      },
    ];
  }

  fromSourceList(sources: KnowledgeSource[]) {
    const createdColor = 'var(--green-500)';
    const modifiedColor = 'var(--yellow-500)';
    const accessedColor = 'var(--blue-500)';
    const events: ProjectCalendarEvent[] = [];
    for (const ks of sources) {
      events.push({
        title: `${ks.title}`,
        start: ks.dateCreated,
        url: ks.id.value,
        color: createdColor,
      });
      ks.dateModified.forEach((d) => {
        events.push({
          title: `${ks.title}`,
          start: d,
          url: ks.id.value,
          color: modifiedColor,
        });
      });
      ks.dateAccessed.forEach((d) => {
        events.push({
          title: `${ks.title}`,
          start: d,
          url: ks.id.value,
          color: accessedColor,
        });
      });
      if (ks.dateDue) {
        events.push({
          title: `${ks.title}`,
          start: ks.dateDue,
          color: 'var(--pink-500)',
          url: ks.id.value,
        });
      }
    }
    return events;
  }
}
