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
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

  async summarizeChunk(text: string) {
    if (!(await this.verifyAPI()) || !this.openai) {
      console.warn(
        "[ChatController]: OpenAI API not initialized or unavailable, skipping summarization..."
      );
      return "";
    }

    const limited = this.tokenizerUtils.limitText.bind(this.tokenizerUtils);
    text = limited(text.replace("\n", " ")).replace("\n", " ");

    const messages = ([] as ChatCompletionMessageParam[]).concat(
      SummarizationPrompts.Common(),
      SummarizationPrompts.Excerpt()
    );

    messages.push({
      role: "user",
      content: text,
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
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Failed to summarize chunk...");
      console.error(error);
      return "";
    }
  }

  async getDateAndAuthors(text: string) {
    if (!(await this.verifyAPI()) || !this.openai) {
      console.warn(
        "[ChatController]: OpenAI API not initialized or unavailable, skipping summarization..."
      );
      return "";
    }

    const limited = this.tokenizerUtils.limitText.bind(this.tokenizerUtils);
    text = limited(text.replace("\n", " ")).replace("\n", " ");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "From the following text, extract both the author's name and the publication date, even if the formatting is irregular.",
      },
      {
        role: "system",
        content:
          "Analyze the text and provide the author's name followed by the publication date.",
      },
      {
        role: "system",
        content:
          "Identify and list the author's name and the publication date from this unstructured text.",
      },
      {
        role: "system",
        content:
          "Parse the text for the author's name and publication date, adapting to any formatting issues.",
      },
      {
        role: "system",
        content:
          "Extract the name of the first author and the date of publication from the given text, considering potential formatting irregularities.",
      },
      {
        role: "system",
        content:
          "Extract the author's name and publication date from the following text, considering any formatting issues.",
      },
      {
        role: "system",
        content:
          "Identify the writer and the date of publication in this text, and provide both in a single response.",
      },
      {
        role: "system",
        content:
          "Analyze the given text to find the author's name and publication date, despite potential formatting challenges.",
      },
      {
        role: "system",
        content:
          "From this text, list the author's name followed by the publication date, addressing any irregular formatting.",
      },
      {
        role: "system",
        content:
          "Parse the text and provide both the name of the first author and the date it was published, taking into account formatting irregularities.",
      },
      {
        role: "system",
        content:
          "If there is more than one author, use the et al. convention (e.g. Smith et al.)",
      },
      {
        role: "user",
        content:
          `Text:\n ===\n${text}\n===\n\n` +
          `===\nAuthor(s): {{author(s) if known, otherwise Unknown}}\n` +
          `Publication Date: {{publication date if known, otherwise Unknown}}\n===\n`,
      },
    ];

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

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Failed to summarize chunk...");
      console.error(error);
      return "";
    }
  }

  async summarizeChunkResponses(responses: string[], windowSize = 3) {
    if (!(await this.verifyAPI()) || !this.openai) {
      console.warn(
        "[ChatController]: OpenAI API not initialized or unavailable, skipping summarization..."
      );
      return "";
    }

    /**
     * At this point, we have an array of responses, each one summarizing a small chunk of the text.
     * We want to summarize all of these responses into a single summary.
     * It is important for there to be some overlap between the chunks, in order to provide context
     * to the summarizer. We will create a sliding window of 3 chunks, where the 3rd chunk of array
     * N is the 1st chunk of array N+1. After all of the chunks have been summarized, we will
     * summarize the resulting array of summaries.
     */

    // Create the sliding windows
    const limited = this.tokenizerUtils.limitText.bind(this.tokenizerUtils);
    const windows: string[] = [];
    for (
      let i = 0;
      i <= responses.length - windowSize + 1;
      i += windowSize - 1
    ) {
      const endIndex =
        i + windowSize - 1 > responses.length - 1
          ? responses.length - 1
          : i + windowSize - 1;
      const window = responses.slice(i, endIndex);
      const windowText = limited(window.join("\n> "));
      windows.push(windowText);
    }

    // Summarize each window
    const summaries: string[] = [];

    for (let i = 0; i < windows.length; i++) {
      const messages = ([] as ChatCompletionMessageParam[]).concat(
        SummarizationPrompts.Common(),
        SummarizationPrompts.Verbose(),
        { role: "user", content: windows[i] }
      );

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

        const summary = response.choices[0].message.content;

        if (summary) {
          summaries.push(summary);
        }
      } catch (error) {
        console.error("Could not get response from OpenAI API...");
        console.error(error);
      }
    }

    // Summarize the summaries
    const messages = ([] as ChatCompletionMessageParam[]).concat(
      SummarizationPrompts.Common(),
      SummarizationPrompts.Verbose(),
      {
        role: "system",
        content:
          "Make sure you include the headings (# and ##) and markdown in your summary!",
      },
      {
        role: "user",
        content: limited(summaries.join(" ")),
      }
    );

    const sectionPrompts = [
      "# (<h1>) {{paraphrased title for the overall summary}}\n" +
        "**Topics:** {{Comma separated list of topics in succinct hashtag (#topic) form}}\n" +
        "## (<h2>) Brief\n" +
        "{{Explain like I'm 5 in 1 to 2 sentences}}\n" +
        "## (<h2>) Summary\n" +
        "{{2 paragraphs summarizing the Source}}\n" +
        "## (<h2>) Important Concepts\n" +
        "{{2 to 3 succinct bullet points on the most important concepts in the Source}}\n" +
        "## (<h2>) Follow Up Questions\n" +
        "{{2 to 3 questions with answers to help dive deeper into the topics and concepts}}\n",
    ];

    // Create 4 calls to the API for each of the 4 sections of the summary
    const config = {
      model: this.settings.model.name,
      temperature: this.settings.model.temperature,
      top_p: this.settings.model.top_p,
      max_tokens: 1024,
      presence_penalty: this.settings.model.presence_penalty,
      frequency_penalty: this.settings.model.frequency_penalty,
    };
    const promises = [];
    for (let i = 0; i < sectionPrompts.length; i++) {
      promises.push(
        this.openai.chat.completions.create({
          ...config,
          messages: messages.concat([
            {
              role: "user",
              content: sectionPrompts[i],
            },
          ]),
        })
      );
    }

    try {
      const responses = await Promise.all(promises);
      return responses.map((r) => r.choices[0].message.content).join("\n\n");
    } catch (error) {
      console.error("Could not get response from OpenAI API...");
      console.error(error);
      return "";
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
        role: "user",
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
