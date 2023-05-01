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

import { ChatCompletionRequestMessage } from 'openai/api';
import { AgentType, ChatMessage } from '@app/models/chat.model';
import { Injectable } from '@angular/core';
import { KcProject } from '@app/models/project.model';
import { ProjectService } from '@services/factory-services/project.service';
import { ChatService } from '@services/chat-services/chat.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectChat {
  private AGENT_PROMPTS = [
    'Knowledge is a digital knowledge management tool that helps users store, organize, and understand information.',
    'You are the Project agent for the Knowledge application.',
    'You should ignore capitalization and punctuation when processing user input, especially for names of projects and sources.',
    'The Project agent is a virtual assistant that helps the user manage and complete a Project in the Knowledge application.',
    'A Project has at least the following information: name, description, sources, and subprojects.',
    `The Project can also be referred to as "the project", "this project", "a project", etc.`,
    'The Project has a collection of Sources that the user wants to learn more about.',
    'You should ask the user about their existing knowledge on the Project topic and the specific Sources involved.',
    'Offer recommendations for new Sources to add to the Project based on the overall content of the Project.',
    "Track the user's progress on the Project and offer suggestions for how to stay on track or adjust the timeline if necessary.",
    'Offer feedback or suggestions on the overall organization or structure of the Project, based on best practices or similar successful projects.',
    'Provide an estimate of the time required to complete the Project, based on the scope and complexity of the work.',
    'Help the user break down the Project into smaller, manageable pieces or milestones, and offer suggestions for how to approach each piece.',
    'Offer suggestions for additional tools or resources that might be useful for completing the Project, such as software or online courses.',
    'You and the user are both aware of the titles (or names) of the sources in this Project.',
    'Use the titles or names of the Sources to help the user understand the content of the Project.',
    'Use Markdown to format your responses to the user and make them more visually appealing.',
    'You are familiar with both HTML and Markdown, and can use it to format your responses to the user.',
    'You should always try to use the HTML <mark> tags for important concepts and topics.',
    'For instance, if the topic "Computer Science" is relevant or important, you should return: <mark class="[UUID] highlight-yellow">Computer Science</mark>',
  ];

  constructor(private chat: ChatService, private projects: ProjectService) {}

  /**
   * Send a message to OpenAI
   * @param project
   * @param history
   * @param prompt
   */
  send(project: KcProject, history: ChatMessage[], prompt?: string) {
    const prompts = this.getProjectPrompts(project);
    this.chat
      .convertToOpenAI(history)
      .forEach((message) => prompts.push(message));

    // Add the user's message to the prompts
    if (prompt) {
      prompts.push({
        role: AgentType.User,
        content: prompt,
        name: AgentType.Project,
      });
    }

    return this.chat.send(prompts);
  }

  /**
   * Get the project hierarchy in text format
   * @param project
   * @private
   */
  private getAncestorTreeAsText(project: KcProject) {
    // Get project tree for all ancestors
    const ancestors = this.projects.getAncestors(project.id.value);
    if (ancestors.length <= 1) {
      return 'This project is the root project and has no ancestors.';
    }

    let ancestorGraphText =
      'Project ancestors from the root project to this project: ';
    for (const ancestor of ancestors) {
      ancestorGraphText += `"${ancestor.title}"` + ' -> ';
    }
    // Remove the last arrow
    ancestorGraphText = ancestorGraphText.substring(
      0,
      ancestorGraphText.length - 4
    );
    return ancestorGraphText;
  }

  /**
   * Get the prompts for the project
   * @param project
   * @private
   */
  private getProjectPrompts(
    project: KcProject
  ): ChatCompletionRequestMessage[] {
    // Convert the AGENT_PROMPTS into a list of ChatCompletionRequestMessage objects
    const prompts: ChatCompletionRequestMessage[] = this.AGENT_PROMPTS.map(
      (prompt) => {
        return { role: 'system', content: prompt };
      }
    );

    // Add the project name
    prompts.push({
      role: 'system',
      content: `The name of this Project is "${project.name}"`,
    });

    // Add the project tree as a prompt if it has ancestors
    const subtree = this.projects
      .getSubTree(project.id)
      .filter((p) => p.id !== project.id.value);
    if (subtree.length > 0) {
      let subtreeText = `The following is a list of all of the subprojects for the "${project.name}" Project: `;
      subtreeText += subtree
        .map((subproject) => `"${subproject.title}"`)
        .join(', ');
      prompts.push({ role: 'system', content: `${subtreeText}` });
    }

    // Add the project's sources
    if (project.knowledgeSource.length > 0) {
      let sources =
        'The following is a list of all of the Sources in this Project: ';
      sources += project.knowledgeSource
        .map((ks) => `"${ks.title}"`)
        .join(', ');
      prompts.push({ role: 'system', content: sources });
    }

    // Add the subproject sources
    for (const subproject of subtree) {
      const subp = this.projects.getProject(subproject.id);
      if (subp && subp.knowledgeSource.length > 0) {
        prompts.push({
          role: 'system',
          content: `The "${
            subp.name
          }" subproject has the following sources: ${subp.knowledgeSource
            .map((ks) => `"${ks.title}"`)
            .join(', ')}`,
          name: 'project',
        });
      }
    }

    // Add the user's project description as a prompt
    if (project.description && project.description.length > 0) {
      prompts.push({
        role: 'system',
        content: `A description of the ${project.name} is "${project.description}"`,
      });
    }

    return prompts;
  }
}
