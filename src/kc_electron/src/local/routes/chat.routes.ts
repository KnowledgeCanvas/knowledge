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

import express from "express";
import ChatController from "../controllers/chat.controller";

const router = express.Router();

export default class ChatRoutes {
  private chatController: ChatController;

  constructor(chatController: ChatController) {
    this.chatController = chatController;
    this.getRouter();
  }

  get controller() {
    return this.chatController;
  }

  getRouter() {
    router.post("/", this.chatController.chat.bind(this.chatController));
    router.post(
      "/tokens",
      this.chatController.tokens.bind(this.chatController)
    );

    return router;
  }
}
