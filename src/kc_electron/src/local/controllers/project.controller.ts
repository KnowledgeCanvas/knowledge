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

export default class ProjectChatController {
  async chat(req: Request, res: Response): Promise<Response> {
    // Load the entire source here
    return res.status(500).json({ message: "Not implemented" });
  }

  async intro(req: Request, res: Response): Promise<Response> {
    // Load the entire source here
    console.log("Got request on sources/intro...");
    return res.status(500).json({ message: "Not implemented" });
  }
}
