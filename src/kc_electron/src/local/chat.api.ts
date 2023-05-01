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

import express, { Express } from "express";
import cors from "cors";
import { ErrorHandler } from "./middleware/ErrorHandler";

import chatRoutes from "./routes/chat.routes";
import apiRoutes from "./routes/api.routes";
import sourceRoutes from "./routes/source.routes";

export default class ChatServer {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  start(port: number) {
    this.app.listen(port, () => {
      console.log(`Chat server listening on port ${port}`);
    });
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: "1mb" })); // Parse JSON request bodies
    this.app.use(cors()); // Enable CORS
  }

  private setupRoutes() {
    this.app.use("/api", ErrorHandler.catchErrors(apiRoutes));
    this.app.use("/sources", ErrorHandler.catchErrors(sourceRoutes));
    this.app.use("/chat", ErrorHandler.catchErrors(chatRoutes));
  }
}
