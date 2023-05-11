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

import dotenv from "dotenv";
import { notarize } from "electron-notarize";

exports.default = async function notarizing(context) {
  dotenv.config();

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appleId = process.env.APPLEID;
  const password = process.env.APPLEPWD;

  return await notarize({
    appBundleId: "com.knowledge.canvas.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: password,
  });
};
