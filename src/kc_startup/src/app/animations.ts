/*
 * Copyright (c) 2022-2023 Rob Royce
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
import {animate, style, transition, trigger} from "@angular/animations";

export const fadeIn = [
  trigger('fadeIn', [
    transition(':enter', [
      style({opacity: 0}),
      animate('1000ms', style({opacity: 1})),
    ])
  ])
]

export const fadeOut = [
  trigger('fadeOut', [
    transition(':leave', [
      style({opacity: 1}),
      animate('1000ms', style({opacity: 0})),
    ])
  ])
]
