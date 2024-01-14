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

import ApiKeyController from "../controllers/api.controller";
import express from "express";

const router = express.Router();

export default class ApiRoutes {
  private apiKeyController: ApiKeyController;

  constructor(controller: ApiKeyController) {
    this.apiKeyController = controller;
    this.getRouter();
  }

  get controller() {
    return this.apiKeyController;
  }

  getRouter() {
    router.post(
      "/key",
      this.apiKeyController.setApiKey.bind(this.apiKeyController)
    );
    router.get(
      "/key",
      this.apiKeyController.hasApiKey.bind(this.apiKeyController)
    );
    router.delete(
      "/key",
      this.apiKeyController.deleteApiKey.bind(this.apiKeyController)
    );

    return router;
  }
}
