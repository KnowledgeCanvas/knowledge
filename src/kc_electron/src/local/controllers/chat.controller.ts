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
import { Configuration, OpenAIApi } from "openai";
import chatEncrypt from "../utils/encrypt.utils";
import { map } from "rxjs";
import {
  ChatSettingsModel,
  SettingsModel,
} from "../../../../kc_shared/models/settings.model";
import tokenizerUtils from "../utils/tokenizer.utils";

const settings = require("../../app/services/settings.service");

export default class ChatController {
  private openai?: OpenAIApi;

  private settings: ChatSettingsModel = new ChatSettingsModel();

  constructor() {
    this.init();

    settings.all
      .pipe(map((s: SettingsModel) => s.app.chat))
      .subscribe((chatSettings: ChatSettingsModel) => {
        if (chatSettings.model.name !== this.settings.model.name) {
          tokenizerUtils.setModel(chatSettings.model.name);
        }
        this.settings = chatSettings;
      });
  }

  async chat(req: Request, res: Response): Promise<Response> {
    if (!this.veryifyApi() || !this.openai) {
      return res.status(500).json({
        error: "OpenAI API not initialized",
      });
    }

    // Remove any duplicate messages
    let messages = tokenizerUtils.deduplicate(req.body.messages);

    try {
      // TODO: This should be specified depending on the model
      messages = tokenizerUtils.limitTokens(
        messages,
        4096 - this.settings.model.max_tokens
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
    try {
      const response = await this.openai.createChatCompletion({
        model: this.settings.model.name,
        temperature: this.settings.model.temperature,
        top_p: this.settings.model.top_p,
        max_tokens: this.settings.model.max_tokens,
        presence_penalty: this.settings.model.presence_penalty,
        frequency_penalty: this.settings.model.frequency_penalty,
        messages: messages,
      });
      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Error calling OpenAI API",
      });
    }
  }

  async langchainChat(req: Request, res: Response): Promise<Response> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: "API key not found",
      });
    }

    return res.json({});
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
      this.openai = new OpenAIApi(
        new Configuration({
          apiKey: apiKey,
        })
      );
    }
  }

  private async testApiKey(apiKey: string) {
    try {
      const config = new Configuration({
        apiKey: apiKey,
      });
      const openaiTest = new OpenAIApi(config);
      const models = await openaiTest.listModels();
      return models.status === 200;
    } catch (e) {
      return false;
    }
  }
}
