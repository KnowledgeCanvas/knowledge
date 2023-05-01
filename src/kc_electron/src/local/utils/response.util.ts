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

import { Response } from "express";

export class ResponseUtil {
  static sendResponse<T>(
    res: Response,
    message: string,
    data: T,
    statusCode = 200,
    paginationInfo: any = null
  ): Response<T> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination: paginationInfo,
      status: statusCode,
    });
  }

  static sendError<T>(
    res: Response,
    message: string,
    statusCode = 500,
    error: T
  ): Response<T> {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
