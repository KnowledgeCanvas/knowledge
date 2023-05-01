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
import chokidar, { FSWatcher } from "chokidar";
import { IpcMessage } from "../../../../kc_shared/models/electron.ipc.model";
import {
  IngestSettingsModel,
  SettingsModel,
} from "../../../../kc_shared/models/settings.model";
import {
  FileSourceModel,
  FileWatcherUpdate,
  PendingFileTransfer,
} from "../../../../kc_shared/models/file.source.model";
import { Stats } from "fs";

import fse from "fs-extra";

import mime from "mime-types";

const share: any = (global as any).share;
const fs = share.fs;
const path = share.path;
const shell = share.shell;
const ipcMain = share.ipcMain;
const uuid = share.uuid;
const settingsService = require("./settings.service");

const PENDING_DIR = () => {
  const appPath = settingsService.getSettings().system.appPath;
  const pendingSuffix = "pending";
  return path.resolve(appPath, pendingSuffix);
};

const FILES_DIR = () => {
  const appPath = settingsService.getSettings().system.appPath;
  const pendingSuffix = "files";
  return path.resolve(appPath, pendingSuffix);
};

class FileManagerService {
  private static channels = {
    finalize: "A2E:Autoscan:Finalize",
    delete: "A2E:Autoscan:Delete",
    moveToManaged: "A2E:FileSystem:MoveToManaged",
    error: "E2A:FileManager:Error",
    warn: "E2A:FileManager:Warn",
    newFiles: "E2A:FileManager:NewFiles",
    confirmAdd: "E2A:FileManager:ConfirmAdd",
  };
  ingestWatcher: FSWatcher | null = null;
  interval: any = undefined;
  queue: string[] = [];
  state = "";
  pending: PendingFileTransfer[] = [];
  /* A list of filenames that should be ignored when checking for unfinished file transfers */
  private whitelist = [".DS_Store"];

  constructor() {
    // Listen for updates from the app (i.e. when KS have been successfully imported)
    ipcMain.on(
      FileManagerService.channels.finalize,
      (event: any, update: FileWatcherUpdate) => {
        this.finalize(update.id, update.method);
      }
    );
    ipcMain.on(FileManagerService.channels.delete, (_: any, path: string) => {
      FileManagerService.delete(path);
    });
    ipcMain.on(
      FileManagerService.channels.moveToManaged,
      (_: any, currPath: string) => {
        const filename = path.basename(currPath);
        const storageLocation =
          settingsService.getSettings().ingest.manager.storageLocation;
        const newPath = path.resolve(storageLocation, "files", filename);
        FileManagerService.move(currPath, newPath);
      }
    );

    setTimeout(() => {
      this.getPending().then((pending) => {
        this.pending = pending;

        // Listen for updates from settings service, then update accordingly
        settingsService.all.subscribe((settings: SettingsModel) => {
          this.update(settings);
        });
      });
    }, 500);
  }

  private static delete(path: string) {
    try {
      FileManagerService.warn("Deleting Autoscan File", path);
      shell.trashItem(path);
    } catch (e) {
      FileManagerService.error("Exception", `Failed to delete file at ${path}`);
    }
  }

  private static error(label: string, message: string, code = 500) {
    const kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    const msg: IpcMessage = {
      error: {
        label: label,
        message: message,
        code: code,
      },
      success: undefined,
    };

    if (kcMainWindow.webContents) {
      kcMainWindow.webContents.send(FileManagerService.channels.error, msg);
    }
    console.error(`FileManager ${label} ${message} (${code})`);
  }

  private static warn(label: string, message: string, code = 200) {
    const kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    const msg: IpcMessage = {
      error: {
        label: label,
        message: message,
        code: code,
      },
      success: undefined,
    };

    if (kcMainWindow.webContents) {
      kcMainWindow.webContents.send(FileManagerService.channels.warn, msg);
    }

    console.warn(`FileManager ${label} ${message} (${code})`);
  }

  private static move(from: string, to: string) {
    // TODO: differentiate between file and directory
    // TODO: move directory
    console.warn(`FileManager moving file from ${from} to ${to}`);
    try {
      FileManagerService.warn("Moving File", `${from} --> ${to}`);
      fse.move(from, to, { overwrite: true }, (err: any) => {
        if (err) {
          console.error(`Cannot move from ${from} to ${to}...`, err);
        }
      });
    } catch (e) {
      FileManagerService.error(
        "Exception",
        `Failed to move file from ${from} to ${to}` + e
      );
    }
  }

  private static revert(pending: PendingFileTransfer) {
    const revertPath = path.resolve(pending.oldPath, pending.filename);
    console.log(`Reverting from ${pending.newPath} to ${revertPath}`);
    // FileManagerService.move(pending.newPath, revertPath);
  }

  private async getLocalStorageItem(key: string) {
    const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
    return kcMainWindow.webContents.executeJavaScript(
      `localStorage.getItem('${key}');`,
      true
    );
  }

  private async setLocalStorageItem(key: string, value: any) {
    const val = JSON.stringify(value);
    const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
    return kcMainWindow.webContents.executeJavaScript(
      `localStorage.setItem('${key}', '${val}');`,
      true
    );
  }

  private async addPending(pending: PendingFileTransfer) {
    this.pending.push(pending);
    await this.setLocalStorageItem("PENDING", this.pending);
  }

  private async getPending(): Promise<PendingFileTransfer[]> {
    return new Promise<PendingFileTransfer[]>((resolve) => {
      this.getLocalStorageItem("PENDING")
        .then((result) => {
          let pending: PendingFileTransfer[] = [];
          try {
            pending = JSON.parse(result ?? "[]") ?? [];
          } catch (e) {
            pending = [];
          }
          resolve(pending);
        })
        .catch(() => {
          // If it does not already exist, create it
          this.setLocalStorageItem("PENDING", this.pending);
          resolve([]);
        });
    });
  }

  private async removePending(id: string) {
    this.pending = this.pending.filter((p) => p.id !== id);
    await this.setLocalStorageItem("PENDING", this.pending);
  }

  private clean(ingest: IngestSettingsModel) {
    this.getPending().then((pending) => {
      // If there are any files with the PENDING_PREFIX, move them back to the autoscan directory. Runs only once at startup
      let files;
      try {
        const pendingPath = path.resolve(
          ingest.manager.storageLocation,
          "pending"
        );
        files = fs.readdirSync(pendingPath);
      } catch (e) {
        return;
      }

      const move: { from: string; to: string }[] = [];

      for (const file of files) {
        const filename = path.basename(file);

        if (this.whitelist.includes(filename)) {
          continue;
        }

        console.log(
          "AutoscanService: Found pending files in autoscan storage location...",
          file
        );

        const exists = pending.find((p) => p.newPath.includes(filename));
        if (exists) {
          move.push({
            from: exists.newPath,
            to: path.resolve(ingest.autoscan.path, exists.filename),
          });
          this.removePending(exists.id);
        } else {
          const oldPath = path.resolve(
            ingest.manager.storageLocation,
            "pending",
            file
          );
          const newPath = path.resolve(ingest.autoscan.path, filename);
          move.push({ from: oldPath, to: newPath });
        }
      }

      if (move.length > 0) {
        setTimeout(() => {
          for (const mv of move) {
            console.log(`Moving file from ${mv.from} to ${mv.to}`);
            FileManagerService.move(mv.from, mv.to);
          }
        }, 5000);
      }
    });
  }

  private async confirmAdd(id: string, newPath: string) {
    const kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    const req: IpcMessage = {
      error: undefined,
      success: {
        data: {
          id: id,
          newPath: newPath,
        },
      },
    };
    kcMainWindow.webContents.send(FileManagerService.channels.confirmAdd, req);
  }

  private async finalize(id: string, method: "add" | "remove" | "delay") {
    const pending = this.pending.find((p) => p.id === id);
    if (!pending) {
      return;
    } else {
      switch (method) {
        case "add":
          // Add => Remove the `pending` prefix from the file
          FileManagerService.move(
            pending.newPath,
            path.resolve(FILES_DIR(), path.basename(pending.newPath))
          );
          await this.confirmAdd(
            id,
            path.resolve(FILES_DIR(), path.basename(pending.newPath))
          );
          break;
        case "remove":
          // Remove => Remove new
          FileManagerService.delete(pending.newPath);
          break;
        case "delay":
        default:
          FileManagerService.revert(pending);
      }
      await this.removePending(id);
    }
  }

  private reset() {
    clearInterval(this.interval);
    this.ingestWatcher = null;
    this.queue = [];

    for (const pending of this.pending) {
      FileManagerService.revert(pending);
    }
    this.pending = [];
  }

  private setWatcher(watchPath: string) {
    this.ingestWatcher = chokidar
      .watch(watchPath, {
        // intended behavior: ignore dotfiles
        ignored: /(^|[/\\])\../,

        // intended behavior: keep the file watcher running as long as the user has 'Autoscan' enabled
        persistent: true,

        // intended behavior: if the user doesn't move the files, then we shouldn't touch them and show them next time
        ignoreInitial: false,
      })
      .on("add", (filePath: string) => {
        const found = this.queue.find((f) => f === filePath);
        if (!found) {
          this.queue.push(filePath);
        }
      });
  }

  private start(settings: IngestSettingsModel) {
    console.warn("Starting File Watcher", settings.autoscan.path);
    const watchPath = path.resolve(settings.autoscan.path);
    const storagePath = path.resolve(settings.manager.storageLocation);

    try {
      fs.statSync(watchPath);
    } catch (e) {
      fs.mkdirSync(watchPath, { recursive: true });
      FileManagerService.warn("Directory Created", watchPath);
    }

    try {
      fs.statSync(storagePath);
    } catch (e) {
      fs.mkdirSync(storagePath, { recursive: true });
      FileManagerService.warn("Directory Created", storagePath);
    }

    this.setWatcher(watchPath);

    this.interval = setInterval(() => {
      if (this.queue.length <= 0) {
        return;
      }

      const kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
      const requests: IpcMessage[] = [];

      for (const filePath of this.queue) {
        // Retrieve file stats from OS, used to populate FileSourceModel
        let fstat: Stats;
        try {
          fstat = fs.statSync(filePath);
        } catch (e) {
          console.warn("FileWatcher found a file that does not exist...");
          continue;
        }

        /* Generate a new UUID, to be used as the KS identifier and to manage files. */
        const newId = uuid.v4();

        /* Determine file type (MIME type) */
        const contentType = mime.lookup(filePath);
        let fileExtension = mime.extension(contentType || "");
        if (!fileExtension) {
          fileExtension = path.extname(filePath).split(".")[1];
          console.warn(
            `IngestFileWatcher: Could not find file extension for filePath: ${filePath}... using brute force (${fileExtension}) instead`
          );
        }

        /* Resolve the new file path, prepend PENDING_PREFIX to the newId to handle life cycle management */
        const newFilePath =
          path.resolve(PENDING_DIR(), `${newId}`) + `.${fileExtension}`;

        /* Move the file to its new path. */
        FileManagerService.move(filePath, newFilePath);

        /* Create a FileSourceModel that will be used in the main app to import the current file */
        const fileModel: FileSourceModel = {
          filename: path.basename(filePath),
          id: { value: newId },
          path: newFilePath,
          size: fstat.size,
          type: contentType || "",
          accessTime: fstat.atime.toLocaleString() ?? "",
          creationTime: fstat.ctime.toLocaleString() ?? "",
          modificationTime: fstat.mtime.toLocaleString() ?? "",
        };

        /* Create an IPC message to be sent to main app */
        const req: IpcMessage = {
          error: undefined,
          success: {
            data: fileModel,
          },
        };
        requests.push(req);

        /* Add this file transfer to the list of pending transfers */
        this.addPending({
          id: newId,
          filename: fileModel.filename,
          oldPath: filePath,
          newPath: newFilePath,
        });
      }

      /* Send all available files to main app as File Models, then clear the queue */
      kcMainWindow.webContents.send(
        FileManagerService.channels.newFiles,
        requests
      );
      this.queue = [];
    }, settings.autoscan.interval * 1000);
  }

  private stop() {
    if (this.ingestWatcher) {
      console.log("Shutting down watcher...");
      this.ingestWatcher.close().catch((reason) => {
        console.warn("Ingest file watcher failed to close... ", reason);
      });
    }
    this.reset();
  }

  private async update(settings: SettingsModel) {
    /* Make sure ingest settings are available */
    if (!settings.ingest) {
      console.warn("Ingest settings not found in retrieved settings model...");
      return;
    }

    /* Check new settings against previous settings using a deep copy of each */
    const str = JSON.stringify(settings.ingest);
    if (str && str === this.state) {
      // Means no settings have changed
      return;
    }

    /* Create new objects for shallow comparison */
    let prev: IngestSettingsModel | undefined;
    let next: IngestSettingsModel | undefined;

    try {
      prev = JSON.parse(this.state);
    } catch (e) {
      prev = undefined;
    }

    try {
      next = JSON.parse(str);
    } catch (e) {
      next = undefined;
    }

    if (!next) {
      return;
    }

    /* Previous settings do not exist */
    if (!prev) {
      this.clean(next);

      if (next.autoscan.enabled) {
        this.start(next);
      }

      prev = next;
    }

    /**
     * TODO: handle the following cases when new settings are received
     *      Case: local ingest settings do not exist
     *      Case: new settings are the same as the previous settings
     *      Case: autoscan toggled on
     *      Case: autoscan toggled off
     *      Case: autoscan path changed
     *      Case: storage path changed
     *      Case: Autoscan interval has changed
     */

    /* Case: Autoscan toggled ON */
    if (next.autoscan.enabled && !prev.autoscan.enabled) {
      console.debug("Autoscan toggled on...");
      this.start(next);
    } else if (!next.autoscan.enabled && prev.autoscan.enabled) {
      /* Case: Autoscan toggled OFF */
      console.debug("Autoscan toggled off...");
      this.stop();
    } else if (prev.autoscan.enabled && next.autoscan.enabled) {
      /* Case: Autoscan already on, but some other setting changed */
      /* Case: Autoscan interval or path change */
      if (
        prev.autoscan.interval !== next.autoscan.interval ||
        prev.autoscan.path !== next.autoscan.path
      ) {
        if (prev.autoscan.interval !== next.autoscan.interval) {
          console.debug(
            `Autoscan interval changed: ${prev.autoscan.interval} to ${next.autoscan.interval}`
          );
        }
        if (prev.autoscan.path !== next.autoscan.path) {
          console.debug(
            `Autoscan path changed: ${prev.autoscan.path} to ${next.autoscan.path}`
          );
        }
        this.stop();
        this.start(next);
      }
    }

    /* Case: Storage path changed */
    // TODO: this is currently disabled in the main app until it is fixed
    if (prev.manager.storageLocation !== next.manager.storageLocation) {
      // TODO: should we move everything from the current location to the new location, or let the user worry about that?
      //  storageLocation currently includes the /files suffix, this should be appended manually and the storageLocation should be the base path, not the files path
      //  itself
      console.debug(
        `Storage path changed, moving to new location: ${next.manager.storageLocation} from ${prev.manager.storageLocation}`
      );

      this.stop();

      // TODO: this doesn't actually work...
      FileManagerService.move(
        prev.manager.storageLocation,
        next.manager.storageLocation
      );

      for (const pending of this.pending) {
        // TODO: make sure the new path is taken into account
        const pendingFilename = path.basename(pending.newPath);
      }

      this.start(next);
    }
    this.state = str;
  }
}

const fileManagerService = new FileManagerService();

module.exports = {
  fileManager: fileManagerService,
};
