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

import express from "express";
import SourceChatController from "../controllers/source.controller";

const sourceController = new SourceChatController();

const router = express.Router();

router.post("/", sourceController.chat.bind(sourceController));
router.post("/intro", sourceController.intro.bind(sourceController));
// router.post("/pdf", sourceController.pdf.bind(sourceController));

export default router;
