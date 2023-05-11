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

import CryptoJS from "crypto-js";
import fs from "fs";

export class EncryptUtils {
  encryptApiKey(apiKey: string, secretKey: string): string {
    return CryptoJS.AES.encrypt(apiKey, secretKey).toString();
  }

  decryptApiKey(encrypted: string, secret: string): string {
    const apiKey = CryptoJS.AES.decrypt(encrypted, secret);
    return apiKey.toString(CryptoJS.enc.Utf8);
  }

  async readAndDecryptApiKey(keyPath: string, secret: string): Promise<string> {
    const filePath = keyPath;

    if (!fs.existsSync(filePath)) {
      return "";
    }

    const encryptedApiKey = fs.readFileSync(filePath, "utf-8");
    return this.decryptApiKey(encryptedApiKey, secret);
  }
}

const chatEncrypt = new EncryptUtils();
export default chatEncrypt;
