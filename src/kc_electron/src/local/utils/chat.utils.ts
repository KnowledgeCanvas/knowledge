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

import { ChatCompletionRequestMessage } from "openai/api";
import TokenizerUtils from "./tokenizer.utils";

const settings = require("../../app/services/settings.service");

export default class ChatUtils {
  constructor() {}

  /**
   * Reduce the messages to a single message while retaining as much information as possible
   * @param messages
   */
  async reduce(messages: ChatCompletionRequestMessage[]) {}

  async refine(messages: ChatCompletionRequestMessage[]) {}

  /**
   * Split the text into chunks and summarize each chunk
   * @param text
   */
  async mapReduce(text: string) {
    const tokenizer = this.getTokenizer();
    const tokenCount = tokenizer.countTokens(text);
    console.log("Token count: ", tokenCount);
  }

  private getTokenizer() {
    const tokenizer = new TokenizerUtils();
    const model = settings.getSettings().app.chat.model.name;
    tokenizer.setModel(model);
    return tokenizer;
  }
}
