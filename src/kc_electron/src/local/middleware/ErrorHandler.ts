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

import { NextFunction, Request, Response } from "express";
import { ResponseUtil } from "../utils/response.util";

export class ErrorHandler {
  static catchErrors(fn: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static handleErrors(err: any, req: Request, res: Response) {
    console.error(err);

    if (err.message === "Invalid file type") {
      return ResponseUtil.sendError(res, "Invalid file type", 422, null);
    }

    return res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }

  static formatErrors(error: any) {
    // Used in conjunction with class-validator to handle format errors
    const errors = {};
    error.forEach((e: any) => {
      // @ts-ignore
      if (!errors[e.property]) {
        // @ts-ignore
        errors[e.property] = [];
      }
      // @ts-ignore
      errors[e.property].push(e.constraints[Object.keys(e.constraints)[0]]);
    });
    return errors;
  }
}
