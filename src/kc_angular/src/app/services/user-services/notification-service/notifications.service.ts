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
import {SettingsService} from "../../ipc-services/settings-service/settings.service";
import {DisplaySettingsModel, LoggingSettingsModel} from "../../../../../../kc_shared/models/settings.model";

export type KcNotificationPresentation = 'banner' | 'none' | 'toast'

export interface KcNotification extends Message {
  presentation: KcNotificationPresentation
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  logSettings: LoggingSettingsModel = {
    warn: false,
    error: false,
    debug: false
  }

  constructor(private messageService: MessageService, private settingsService: SettingsService) {
    settingsService.display.subscribe((displaySettings: DisplaySettingsModel) => {
      this.logSettings = displaySettings.logging;
    })
  }

  toast(msg: KcNotification) {
    msg.key = 'app-toast';
    msg.life = msg.life ?? 5000;
    this.messageService.add(msg);
  }

  banner(msg: KcNotification) {
    msg.key = 'app-banner'
    msg.life = msg.life ?? 5000;
    msg.sticky = msg.sticky ? msg.sticky : false
    this.messageService.add(msg);
  }

  datetime = (): string => {
    return new Date().toLocaleString()
  }

  debug(component: string, summary: string, detail: string | any, presentation: KcNotificationPresentation = 'none') {
    console.debug(`[Debug]-[${this.datetime()}]-[${component}]: ${summary} - `, detail);
    const msg: KcNotification = {
      severity: 'info',
      summary: summary,
      detail: detail,
      closable: true,
      life: 3000,
      presentation: presentation
    }
    this.broadcast(msg);
  }

  error(component: string, summary: string, detail: string, presentation: KcNotificationPresentation = 'none') {
    console.error(`[Error]-[${this.datetime()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 5000,
      closable: true,
      presentation: presentation
    }
    this.broadcast(msg);
  }

  log(component: string, summary: string, detail: string) {
    console.log(`[Info ]-[${this.datetime()}]-[${component}]: ${summary} - ${detail}`);
  }

  success(component: string, summary: string, detail: string, presentation: KcNotificationPresentation = 'toast') {
    console.log(`[Info ]-[${this.datetime()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'success',
      summary: summary,
      detail: detail,
      closable: true,
      presentation: presentation
    }
    this.broadcast(msg);
  }

  warn(component: string, summary: string, detail: string, presentation: KcNotificationPresentation = 'none') {
    console.warn(`[Warn ]-[${this.datetime()}]-[${component}]: ${summary} - ${detail}`);
    const msg: KcNotification = {
      severity: 'warn',
      summary: summary,
      detail: detail,
      life: 10000,
      closable: true,
      presentation: presentation
    }
    this.broadcast(msg);
  }

  broadcast(msg: KcNotification) {
    switch (msg.presentation) {
      case "none":
        if (this.logSettings?.debug) {
          this.toast(msg);
        }
        break;
      case "toast":
        this.toast(msg);
        break;
      case "banner":
        // this.banner(msg);
        // TODO: the banner is broken with the current layout (in apps.component), it sticks to the top and looks bad.
        this.toast(msg);
        break;
      default:
        this.error('NotificationsService', 'Invalid Presentation Type', msg.presentation, 'none');
    }
  }
}
