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

import { Request, Response } from "express";
import chatEncrypt from "../utils/encrypt.utils";
import { debounceTime, map, skip, tap, throttleTime } from "rxjs";
import {
  ChatSettingsModel,
  SettingsModel,
} from "../../../../kc_shared/models/settings.model";
import TokenizerUtils from "../utils/tokenizer.utils";
import { OpenAI } from "openai";
import { CreateChatCompletionRequestMessage } from "openai/resources";

const settings = require("../../app/services/settings.service");

export default class ChatController {
  private openai?: OpenAI;

  private settings: ChatSettingsModel = new ChatSettingsModel();

  private tokenizerUtils: TokenizerUtils;

  constructor(tokenizerUtils: TokenizerUtils) {
    this.tokenizerUtils = tokenizerUtils;

    this.init();

    settings.all
      .pipe(
        skip(1),
        throttleTime(400),
        debounceTime(1000),
        map((s: SettingsModel) => s.app.chat),
        tap((chatSettings: ChatSettingsModel) => {
          this.settings = chatSettings;
        })
      )
      .subscribe();
  }

  getSettings() {
    return this.settings;
  }

  limitText(text: string) {
    return this.tokenizerUtils.limitText(text);
  }

  async summarize(text: string, succinct = true, verbose = false) {
    if (!(await this.veryifyApi()) || !this.openai) {
      return text;
    }

    const limited = this.tokenizerUtils.limitText.bind(this.tokenizerUtils);
    const limitedChunks = this.tokenizerUtils.chunkLimitText.bind(
      this.tokenizerUtils
    );

    try {
      const messages: CreateChatCompletionRequestMessage[] = [
        {
          role: "system",
          content:
            "Your goal is to help the user understand the text by summarzing, paraphrasing, and quoting it as necessary.",
        },
        {
          role: "system",
          content: `Use groupings instead of listing lots of named entities (e.g. use et al. instead of listing 10 different people.).`,
        },
        {
          role: "system",
          content: `If the text does not make sense, simply return an empty string (e.g. "").`,
        },
      ];

      if (succinct && !verbose) {
        messages.push({
          role: "user",
          content: `It is important to be as succinct as possible.`,
        });
        messages.push({
          role: "system",
          content: "The text is a small excerpt from a larger document.",
        });

        const limitedText = limited(text);

        messages.push({
          role: "user",
          content: `\n=========\n"""${limitedText}"""\n=========`,
        });
      } else if (verbose) {
        messages.push({
          role: "system",
          content:
            "The text is a concatenation of your previous responses to the user.",
        });
        messages.push({
          role: "system",
          content:
            "For each section of your response, consider all of the relevant information from your previous responses.",
        });

        const limitedChunksText = limitedChunks(text);
        let chunkedResponse = "";

        for (let i = 0; i < limitedChunksText.length; i++) {
          // If the last message is a user message, remove it from the array
          // This is to ensure that each chunk is removed from the previous query
          if (messages[messages.length - 1].role === "user") {
            messages.pop();
          }

          const chunk = limited(limitedChunksText[i]);

          messages.push({
            role: "user",
            content: `=========\n"""${chunk}"""\n=========`,
          });

          // Sleep for 0.25 seconds to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 250));

          const response = await this.openai.chat.completions.create({
            model: this.settings.model.name,
            temperature: this.settings.model.temperature,
            top_p: this.settings.model.top_p,
            max_tokens: this.settings.model.max_tokens,
            presence_penalty: this.settings.model.presence_penalty,
            frequency_penalty: this.settings.model.frequency_penalty,
            messages: messages,
          });

          const summary = response.choices[0].message.content;
          chunkedResponse += summary + "\n\n";

          if (messages[messages.length - 1].role === "user") {
            messages.pop();
          }

          messages.push({
            role: "system",
            content: `It is important to be as detailed as possible. Your summary should be 2-3 paragraphs in length.`,
          });

          messages.push({
            role: "user",
            content: `=========\n"""${chunkedResponse}"""\n=========`,
          });
        }
      }

      const response = await this.openai.chat.completions.create({
        model: this.settings.model.name,
        temperature: this.settings.model.temperature,
        top_p: this.settings.model.top_p,
        max_tokens: this.settings.model.max_tokens,
        presence_penalty: this.settings.model.presence_penalty,
        frequency_penalty: this.settings.model.frequency_penalty,
        messages: messages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error limiting text...");
      console.error(error);
      return text;
    }
  }

  async chat(req: Request, res: Response): Promise<Response> {
    if (!(await this.veryifyApi()) || !this.openai) {
      return res.status(500).json({
        error: "OpenAI API not initialized",
      });
    }

    // Remove any duplicate messages
    let messages = this.tokenizerUtils.deduplicate(req.body.messages);

    // Insert the existing summary into the messages
    if (req.body.summary) {
      messages.push({
        role: "assistant",
        content: `Here's a summary of the source:\n===\n${req.body.summary}"""\n===\n`,
      });
    }

    try {
      messages = this.tokenizerUtils.limitTokens(
        messages,
        this.settings.model.token_limit - this.settings.model.max_tokens
      );
    } catch (error) {
      console.error("Error limiting chat history due to token count.");
      console.error(error);
      return res.status(500).json({
        error: "Error limiting chat history due to token count.",
      });
    }

    // console.log("After token limit: ", messages);

    console.log("Using chat settings: ", this.settings);
    console.log("Using messages: ", messages);
    try {
      const response = await this.openai.chat.completions.create({
        model: this.settings.model.name,
        temperature: this.settings.model.temperature,
        top_p: this.settings.model.top_p,
        max_tokens: this.settings.model.max_tokens,
        presence_penalty: this.settings.model.presence_penalty,
        frequency_penalty: this.settings.model.frequency_penalty,
        messages: messages,
      });
      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: `Error calling OpenAI API: ${error}`,
      });
    }
  }

  async tokens(req: Request, res: Response): Promise<Response> {
    const text = req.body.text;
    if (!text) {
      return res.status(400).json({
        error: "Missing text",
      });
    }

    const n = this.tokenizerUtils.countTokens(text) - 5;
    return res.json({
      tokens: n,
    });
  }

  private async veryifyApi() {
    if (!this.openai) {
      await this.init();
    }
    return true;
  }

  private async getApiKey() {
    const apiKeyPath = this.getApiKeyPath();
    return await chatEncrypt.readAndDecryptApiKey(apiKeyPath, "unsecured");
  }

  private getApiKeyPath(): string {
    const userDataPath = settings.getSettings().system.appPath;
    return `${userDataPath}/openai.encrypted`;
  }

  private async init() {
    this.openai = undefined;
    const apiKeyPath = this.getApiKeyPath();
    const apiKey = await chatEncrypt.readAndDecryptApiKey(
      apiKeyPath,
      "unsecured"
    );

    if (!apiKey) {
      console.error("API key not found");
      return;
    }

    const apiKeyWorks = await this.testApiKey(apiKey);
    if (!apiKeyWorks) {
      console.error("API key is invalid");
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  private async testApiKey(apiKey: string) {
    try {
      const openaiTest = new OpenAI({
        apiKey: apiKey,
      });
      const models = await openaiTest.models.list();
      return models.data.length > 0;
    } catch (e) {
      return false;
    }
  }
}
