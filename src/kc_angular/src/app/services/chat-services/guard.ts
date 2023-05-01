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

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { ChatService } from '@services/chat-services/chat.service';
import { DialogService } from 'primeng/dynamicdialog';
import { NotificationsService } from '@services/user-services/notifications.service';
import { take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatGuard implements CanActivate {
  constructor(
    private chat: ChatService,
    private dialog: DialogService,
    private notify: NotificationsService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const canChat = this.chat.canChat();

    if (canChat) {
      return true;
    } else {
      this.chat
        .getApiKeyDialog()
        .pipe(
          take(1),
          tap((result: boolean) => {
            if (result) {
              this.router.navigate([
                'app',
                route.url[0].path,
                route.url[1].path,
              ]);
            }
          })
        )
        .subscribe();

      return false;
    }
  }
}
