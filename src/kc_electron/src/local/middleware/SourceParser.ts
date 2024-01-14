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

import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { getDocument } from "pdfjs-dist";
import { htmlToText, HtmlToTextOptions } from "html-to-text";
import fs from "fs";
import TextUtils from "../utils/text.utils";

export class SourceParser {
  static async getText(req: Request, res: Response, next: NextFunction) {
    // If the request already contains text, skip this middleware
    if (req.body.text) {
      console.debug(
        "Text already extracted from source, skipping SourceParser"
      );
      return next();
    }

    const source = req.body.source;
    const ingestType = source.ingestType;

    if (ingestType === "file") {
      req.body.text = await SourceParser.fromFile(source.accessLink);
    } else {
      const accessLink = new URL(source.accessLink);
      req.body.text = await SourceParser.fromWeb(accessLink);
    }

    // Clean the text
    req.body.text = TextUtils.clean(req.body.text);

    console.debug(
      "Length of text extracted from source: ",
      req.body.text.length
    );

    next();
  }

  static async fromFile(filePath: string) {
    // Check if the file is a PDF
    if (filePath.endsWith(".pdf")) {
      console.debug("PDF detected, attempting to extract text from PDF...");
      return SourceParser.fromPdf(filePath);
    } else {
      const supportedFileTypes = [".txt", ".md", ".html", ".htm"];
      const codeFileTypes = [
        ".py",
        ".js",
        ".ts",
        ".java",
        ".c",
        ".cpp",
        ".h",
        ".hpp",
        ".cs",
        ".go",
        ".rs",
        ".sh",
      ];

      // Read the file and check if it is a plain text file
      const dataBuffer = fs.readFileSync(filePath);
      const text = dataBuffer.toString();

      if (supportedFileTypes.some((type) => filePath.endsWith(type))) {
        console.log("Supported file type detected, returning text...");
        return `This file contains the following text: ${text}`;
      } else if (codeFileTypes.some((type) => filePath.endsWith(type))) {
        console.log("Code file detected, returning text...");
        return `This file contains the following source code:
         === BEGIN CODE
         ${text}
         === END CODE
         `;
      } else if (TextUtils.isPlainText(text)) {
        console.log("Plain text file detected, returning text...");
        return `This file contains the following plain text: ${text}`;
      }

      return "UNREADABLE FILE";
    }
  }

  static async fromPdf(filePath: string) {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer.buffer);

    // Load the PDF file using PDF.js
    const loadingTask = getDocument({
      data: uint8Array,
    });
    const pdf = await loadingTask.promise;

    let finalText = "";

    // Loop over each page in the PDF (1-indexed)
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent({
        includeMarkedContent: false,
      });

      // Concatenate content items to assemble final text
      // @ts-ignore -- required because the compiler thinks item.str does not exist
      const strings = content.items.map((item) => item.str);
      finalText += strings.join(" ") + "\n";
    }

    return finalText;
  }

  static async fromWeb(url: URL) {
    const reqUrl = url.toString();

    if (url.href.endsWith(".pdf")) {
      console.log("PDF detected, attempting to extract text from PDF...");

      // Use http to get the PDF, then use pdfjs to extract the text
      const response = await axios.get(reqUrl, { responseType: "arraybuffer" });
      const data = new Uint8Array(response.data);
      const doc = await getDocument(data).promise;

      // Extract text from PDF
      let text =
        "The following is extracted from the PDF (it may be incomplete but you should still attempt to summarize it).";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent({
          includeMarkedContent: false,
        });

        // @ts-ignore -- required because the compiler thinks item.str does not exist
        const pageText = content.items.map((item) => item.str).join(" ");
        text += pageText;
      }

      return text;
    } else {
      const response = await axios.get(reqUrl);
      const h2tOptions: HtmlToTextOptions = {
        wordwrap: false,
        baseElements: {
          selectors: [
            "article",
            "p",
            "blockquote",
            "ol",
            "ul",
            "h1",
            "h2",
            "code",
            "mark",
            "table",
            "h3",
            "h4",
            "h5",
            "h6",
          ],
          orderBy: "selectors",
        },
      };
      return htmlToText(response.data, h2tOptions);
    }
  }
}
