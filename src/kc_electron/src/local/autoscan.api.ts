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
import * as chokidar from "chokidar";
import * as fs from "fs-extra";
import * as path from "path";

/**
 * TODO: Not implemented yet.
 */
export default class Autoscan {
  private sourceDirectory = "./source";
  private pendingDirectory = "./pending";
  private locationMapFile = "fileLocationMap.json";
  private fileLocationMap = new Map<string, string>();

  async processFile(filePath: string) {
    // Implement your custom post-processing logic here
    console.log(`Processing ${filePath}`);
  }

  async moveFileToPending(filePath: string) {
    const fileName = path.basename(filePath);
    const pendingFilePath = path.join(this.pendingDirectory, fileName);

    try {
      await fs.move(filePath, pendingFilePath);
      this.fileLocationMap.set(fileName, pendingFilePath);
      console.log(`Moved ${filePath} to ${pendingFilePath}`);
      await this.saveFileLocationMap();
    } catch (err) {
      console.error(`Failed to move ${filePath} to ${pendingFilePath}`, err);
    }
  }

  async handleNewFile(filePath: string) {
    await this.processFile(filePath);
    await this.moveFileToPending(filePath);
  }

  startWatching() {
    const watcher = chokidar.watch(this.sourceDirectory, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("add", (filePath) => {
      console.log(`New file detected: ${filePath}`);
      this.handleNewFile(filePath);
    });

    watcher.on("error", (error) => console.error(`Watcher error: ${error}`));
  }

  async saveFileLocationMap() {
    const data = JSON.stringify(Array.from(this.fileLocationMap.entries()));
    await fs.writeFile(this.locationMapFile, data, "utf8");
    console.log(`Saved file location map to ${this.locationMapFile}`);
  }

  async loadFileLocationMap() {
    if (await fs.pathExists(this.locationMapFile)) {
      const data = await fs.readFile(this.locationMapFile, "utf8");
      const entries = JSON.parse(data) as [string, string][];
      this.fileLocationMap.clear();
      for (const [key, value] of entries) {
        this.fileLocationMap.set(key, value);
      }
      console.log(`Loaded file location map from ${this.locationMapFile}`);
    }
  }

  async init() {
    await fs.ensureDir(this.sourceDirectory);
    await fs.ensureDir(this.pendingDirectory);

    await this.loadFileLocationMap();
    this.startWatching();
  }
}
