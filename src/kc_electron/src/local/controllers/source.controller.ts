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

import { Request, Response } from "express";
import ChatController from "./chat.controller";
import axios from "axios";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import { ChatCompletionRequestMessage } from "openai/api";
import { introPrompts } from "../constants/source.prompts";

export default class SourceChatController {
  chatController = new ChatController();

  async chat(req: Request, res: Response): Promise<Response> {
    console.warn("/sources/chat is acting as a pass through to /chat.");
    return this.chatController.chat(req, res);
  }

  async intro(req: Request, res: Response): Promise<Response> {
    const source = req.body.source;
    const accessLink = new URL(source.accessLink);
    let messages = req.body.messages || [];
    const noPrompts = messages.length === 0;
    console.log("Messages before extracting text: ", req.body.messages);

    // Get Source prompts based on this specific source, prepend them to messages
    if (noPrompts) {
      const sourceIntroPrompts = introPrompts(source, "source");
      sourceIntroPrompts.forEach((message: any) => {
        messages.push(message);
      });
    }

    // Extract text from web page to feed into the API
    const text = await this.extractText(accessLink);
    messages = this.appendText(messages, text);

    if (noPrompts) {
      messages.push({
        role: "user",
        content: `Can you introduce me to "${source.title}"?`,
      });
    }
    console.log("Messages after extracting text: ", messages);
    return this.chatController.chat(req, res);
  }

  appendText(messages: ChatCompletionRequestMessage[], text: string) {
    messages.push({
      role: "system",
      content: `The following is the text extracted from the Source:\n=========\n"""${text}"""\n=========`,
    });
    messages.push({
      role: "system",
      content: `The text might include information that isn't relevant to the Source. You should attempt to use only relevant information.`,
    });
    return messages;
  }

  async extractText(accessLink: URL) {
    // TODO: Handle remote PDFs
    if (accessLink.href.endsWith(".pdf")) {
      return "";
    }

    const response = await axios.get(accessLink.toString());
    const h2tOptions: HtmlToTextOptions = {
      wordwrap: false,
      baseElements: {
        selectors: [
          "article",
          "p",
          "blockquote",
          "ol",
          "ul",
          "h1",
          "h2",
          "code",
          "mark",
          "table",
          "h3",
          "h4",
          "h5",
          "h6",
        ],
        orderBy: "selectors",
      },
    };
    let text = htmlToText(response.data, h2tOptions);
    text = this.cleanText(text);
    text = text.substring(0, 8192);
    return text;
  }

  private cleanText(text: string) {
    text = text.replace(/(https?:\/\/[^\s]+)/g, "");
    text = text.replace(/(\s{2,})/g, " ");
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    text = text.replace(/(\t)/gm, "");
    text = text.replace(/(\s{2,})/g, " ");
    text = text.replace(/[^a-zA-Z0-9 ]/g, "");
    return text;
  }
}
