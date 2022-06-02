/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {Injectable} from '@angular/core';
import {Message, MessageService} from "primeng/api";

export interface KcNotification extends Message {

}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private messageService: MessageService) {
  }

  toast(msg: KcNotification) {
    msg.key = 'app-toast';
    msg.life = 5000;
    this.messageService.add(msg);
  }

  banner(msg: KcNotification) {
    msg.key = 'app-banner'
    msg.life = 5000;
    this.messageService.add(msg);
  }

  debug(component: string, summary: string, detail: string, presentation: 'banner' | 'none' | 'toast' = 'none') {
    console.debug(`[Debug]-[${Date.now()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'info',
      summary: summary,
      detail: detail
    }

    if (presentation === 'toast') {
      this.toast(msg);
    } else if (presentation === 'banner') {
      this.banner(msg);
    }
  }

  error(component: string, summary: string, detail: string, presentation: 'banner' | 'none' | 'toast' = 'toast') {
    console.error(`[Error]-[${Date.now()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'error',
      summary: summary,
      detail: detail
    }

    if (presentation === 'toast') {
      this.toast(msg);
    } else if (presentation === 'banner') {
      this.banner(msg);
    }
  }

  log(component: string, summary: string, detail: string) {
    console.log(`[Info ]-[${Date.now()}]-[${component}]: ${summary} - ${detail}`);
  }

  success(component: string, summary: string, detail: string, presentation: 'banner' | 'none' | 'toast' = 'toast') {
    console.log(`[Info ]-[${Date.now()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'success',
      summary: summary,
      detail: detail
    }

    if (presentation === 'toast') {
      this.toast(msg);
    } else if (presentation === 'banner') {
      this.banner(msg);
    }
  }

  warn(component: string, summary: string, detail: string, presentation: 'banner' | 'none' | 'toast' = 'toast') {
    console.warn(`[Warn ]-[${Date.now()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'warn',
      summary: summary,
      detail: detail
    }

    if (presentation === 'toast') {
      this.toast(msg);
    } else if (presentation === 'banner') {
      this.banner(msg);
    }
  }
}
