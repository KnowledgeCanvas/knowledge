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
        console.log(
          "[DocumentSummarizer]: Summary already exists, skipping DocumentSummarizer"
        );
        return next();
      }

      // If the request does not contain text, skip this middleware
      try {
        const length = req.body.text.length;
      } catch (err) {
        next();
      }

      // Absolute limit of text length is 100,000 characters, truncate anything above
      if (req.body.text.length > 100000) {
        console.warn(
          `[DocumentSummarizer]: truncating text of size ${req.body.text.length} to 100,000 characters`
        );
        req.body.text = req.body.text.substring(0, 100000);
      }

      // Break the text into chunks under the assumption that each token represents approximately 3 characters
      const CHUNK_SIZE =
        (this.chatController.getSettings().model.token_limit -
          this.chatController.getSettings().model.max_tokens) *
        3;
      const chunks = req.body.text.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g"));

      if (chunks) {
        const summaries = await Promise.all(
          chunks.map(this.chatController.succinct.bind(this.chatController))
        );
        const initialSummaries = summaries.join("\n").trim();
        req.body.summary = await this.chatController.verbose(initialSummaries);
        next();
      } else {
        console.warn("DocumentSummarizer: unable to split text into chunks...");
        next();
      }
    };
  }
}
