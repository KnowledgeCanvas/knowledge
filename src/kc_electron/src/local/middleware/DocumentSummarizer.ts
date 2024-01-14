/*
 * Copyright (c) 2023-2024 Rob Royce
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

import { NextFunction, Request, Response } from "express";
import ChatController from "../controllers/chat.controller";

export class DocumentSummarizer {
  private chatController: ChatController;
  constructor(chatController: ChatController) {
    console.log("DocumentSummarizer initializing...");
    this.chatController = chatController;
  }

  summarize() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // If the request already contains a summary, skip this middleware
      if (req.body.summary) {
        return next();
      }

      let text = req.body.text;

      // Absolute limit of text length is 100,000 characters, truncate anything above
      if (text.length > 100000) {
        console.warn(
          `[DocumentSummarizer]: truncating text of size ${text.length} to 100,000 characters`
        );
        req.body.text = text.substring(0, 100000);
        text = req.body.text;
      }

      // Generate a summary of the text
      const CHUNK_SIZE = 10000;
      const chunks = text.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g"));

      if (chunks) {
        const summaries = await Promise.all(
          chunks.map(this.chatController.summarize.bind(this.chatController))
        );
        const initialSummaries = summaries.join("\n").trim();
        const summary = await this.chatController.summarize(
          initialSummaries,
          false,
          true
        );
        req.body.summary = summary;
        next();
      } else {
        console.warn("DocumentSummarizer: unable to split text into chunks...");
        next();
      }
    };
  }
}
