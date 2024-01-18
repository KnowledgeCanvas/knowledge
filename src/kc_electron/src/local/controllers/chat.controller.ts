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
import { SummarizationPrompts } from "../ai/prompts/summarization.prompts";

const settings = require("../../app/services/settings.service");

/**
 * The ChatController is the only controller that interacts directly with the OpenAI API.
 * All other controllers should interact with the ChatController to access the API.
 * This makes it easier to manage the API key and other settings.
 */
export default class ChatController {
  private openai?: OpenAI;

  private settings: ChatSettingsModel = new ChatSettingsModel();

  private tokenizerUtils: TokenizerUtils;

  /**
   * @param tokenizerUtils The tokenizer utils to use for this controller
   */
  constructor(tokenizerUtils: TokenizerUtils) {
    this.tokenizerUtils = tokenizerUtils;

    // Initialize the OpenAI API
    this.init();

    // Listen for changes to the chat settings and update the settings as necessary
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

  async succinct(text: string) {
    return this.summarize(text, true, false);
  }

  async verbose(text: string) {
    return this.summarize(text, false, true);
  }

  async summarize(
    text: string,
    succinct = true,
    verbose = false
  ): Promise<string> {
    if (!(await this.verifyAPI()) || !this.openai) {
      console.warn(
        "[ChatController]: OpenAI API not initialized or unavailable, skipping summarization..."
      );
      return "";
    }

    // Bind the tokenizer utils to this class, so that we can use them in the
    // async function below without having to pass them in as a parameter
    const limited = this.tokenizerUtils.limitText.bind(this.tokenizerUtils);
    const limitedChunks = this.tokenizerUtils.chunkLimitText.bind(
      this.tokenizerUtils
    );
    const countTokens = this.tokenizerUtils.countTokens.bind(
      this.tokenizerUtils
    );

    const tokenCount = countTokens(text);
    console.log(
      `[ChatController]: Summarizing text (succinct: ${succinct}), (verbose: ${verbose}) with ${tokenCount} tokens...`
    );

    // Create standard set of messages common to both succinct and verbose modes
    const messages = SummarizationPrompts.Common();

    // Verify that the message is short enough to be succinct (if succinct mode)
    if (succinct) {
      console.log(
        `[ChatController]: Verifying text length for succinct mode...`
      );

      console.log(
        `[ChatController]: Text length: ${text.length}, tokens: ${tokenCount}, limit: ${this.settings.model.token_limit}`
      );
      if (tokenCount > this.settings.model.token_limit) {
        console.warn(
          `[ChatController]: Text is too long (${tokenCount} tokens > ${this.settings.model.token_limit} tokens), truncating...`
        );
        text = limited(text);
      }
    }

    if (succinct && !verbose) {
      // Join with SummarizationPrompts.Succinct()
      SummarizationPrompts.Succinct().forEach((message) => {
        messages.push(message);
      });

      // Push the text into the messages
      const limitedText = limited(text);
      messages.push({
        role: "user",
        content: `===\n"""${limitedText}"""\n===`,
      });

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

        return response.choices[0].message.content ?? "";
      } catch (error) {
        console.error("Could not get response from OpenAI API...");
        console.error(error);
        return "";
      }
    }

    // Otherwise, verbose mode

    try {
      if (succinct && !verbose) {
        messages.push();
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

        console.log(
          `[ChatController]: Limiting text to ${limitedChunksText.length} chunks...`
        );

        for (let i = 0; i < limitedChunksText.length; i++) {
          // If the last message is a user message, remove it from the array
          // This is to ensure that each chunk is removed from the previous query
          if (messages[messages.length - 1].role === "user") {
            messages.pop();
          }

          const chunk = limited(limitedChunksText[i]);

          messages.push({
            role: "user",
            content: `===\n"""${chunk}"""\n===`,
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
            content: `It is important to be as detailed as possible.`,
          });

          messages.push({
            role: "user",
            content: `===\n"""${chunkedResponse}"""\n===`,
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

      return response.choices[0].message.content ?? "";
    } catch (error) {
      console.error("Error limiting text...");
      console.error(error);
      return text;
    }
  }

  async passthrough(req: Request, res: Response): Promise<Response> {
    if (!req.body.messages) {
      return res.status(400).json({
        error: "Missing messages",
      });
    }

    if (!(await this.verifyAPI()) || !this.openai) {
      return res.status(500).json({
        error: "OpenAI API not initialized",
      });
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.settings.model.name,
        temperature: this.settings.model.temperature,
        top_p: this.settings.model.top_p,
        max_tokens: this.settings.model.max_tokens,
        presence_penalty: this.settings.model.presence_penalty,
        frequency_penalty: this.settings.model.frequency_penalty,
        messages: req.body.messages,
      });
      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: `Error calling OpenAI API: ${error}`,
      });
    }
  }

  async chat(req: Request, res: Response): Promise<Response> {
    if (!(await this.verifyAPI()) || !this.openai) {
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

  private async verifyAPI() {
    if (!this.openai) {
      try {
        await this.init();
      } catch (e) {
        console.error(
          `Unable to initialize OpenAI API upon verification... something is wrong.`
        );
        console.error(e);
        return false;
      }
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
