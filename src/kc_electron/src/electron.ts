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

import { UpdateCheckResult } from "electron-updater";

const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  dialog,
  shell,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const nativeImage = require("electron").nativeImage;
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const settingsService = require("./app/services/settings.service");
const uuid = require("uuid");
const MAIN_ENTRY: string = path.join(
  app.getAppPath(),
  "src",
  "kc_angular",
  "dist",
  "main",
  "index.html"
);

(global as any).share = {
  BrowserView,
  BrowserWindow,
  app,
  autoUpdater,
  dialog,
  fs,
  http,
  ipcMain,
  nativeImage,
  path,
  settingsService,
  shell,
  url,
  uuid,
};

console.log("Dirname: ", __dirname);

// Setup auto update
require("./app/services/auto.update.service");

// Setup IPC
require("./app/ipc");

// Setup knowledge source ingestion
require("./app/services/index");

const browserIpc = require("./app/ipc").browserIpc;

// Get application settings
const appEnv = settingsService.getSettings();

// Declare main window for later use
let kcMainWindow: any;

/**
 * Main Window Functions
 */
function createMainWindow() {
  const WIDTH: number = parseInt(appEnv.env.DEFAULT_WINDOW_WIDTH);
  const HEIGHT: number = parseInt(appEnv.env.DEFAULT_WINDOW_HEIGHT);
  const darkMode = appEnv.display.theme.isDark;
  const backgroundColor = darkMode ? "#1E1E1E" : "#F9F9F9";
  console.log("Theme: ", appEnv.display.theme);

  console.log("Knowledge storage path: ", app.getPath("userData"));

  app.setName("Knowledge");

  // kcMainWindow = new BrowserWindow(config);
  kcMainWindow = new BrowserWindow({
    title: "Knowledge",
    backgroundColor: backgroundColor,
    width: WIDTH ? WIDTH : 1280,
    height: HEIGHT ? HEIGHT : 1600,
    minWidth: 800,
    minHeight: 800,
    frame: false,
    icon: path.resolve(app.getAppPath(), "..", "icon.png"),
    show: false,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(
        app.getAppPath(),
        "src",
        "kc_electron",
        "dist",
        "preload.js"
      ),
    },
  });

  setMainWindowListeners();
}

function setMainWindowListeners() {
  kcMainWindow.webContents.on(
    "did-fail-load",
    (
      event: any,
      errorCode: number,
      errorDescription: string,
      validatedURL: string,
      ...other: any
    ) => {
      event.preventDefault();

      const defaultAction = () => {
        browserIpc.destroyBrowserViews(kcMainWindow);
        kcMainWindow.loadFile(MAIN_ENTRY);
        return;
      };

      const sender = event.sender;

      if (errorCode === -6 || errorDescription === "ERR_FILE_NOT_FOUND") {
        if (validatedURL.includes(process.cwd())) {
          defaultAction();
        }
      }

      if (!sender || sender.isCrashed() || sender.isDestroyed()) {
        defaultAction();
      }
    }
  );

  // Destroy window on close
  kcMainWindow.on("closed", function () {
    kcMainWindow = null;
    app.quit();
  });

  // Handle event in which a new window is created (i.e. when a user clicks on a link that is meant to open in new tab, etc)
  kcMainWindow.webContents.on("new-window", (event: any, url: string) => {
    console.log("New window requested: ", url);
    event.preventDefault();
    shell.openExternal(url);
  });

  // Show the window once it's ready
  kcMainWindow.once("ready-to-show", () => {
    kcMainWindow.show();
  });
}

app.on("window-all-closed", function () {
  // MacOS apps typically do not quit all the way when a window is closed...
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("ready", function () {
  // Create window but wait to load and show until after update
  createMainWindow();

  autoUpdater
    .checkForUpdatesAndNotify()
    .then((update: UpdateCheckResult | null) => {
      if (update) {
        // TODO: take action on new versions, such as an "Updating" window or compatibility checks
        console.log("Update Check Results: ", update);
      }
    })
    .catch((reason: any) => {
      console.error("Update Check Error: ", reason);
    })
    .finally(() => {
      kcMainWindow.loadFile(MAIN_ENTRY);
    });
});
