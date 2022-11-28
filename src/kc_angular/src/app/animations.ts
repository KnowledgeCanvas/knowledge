/*
 * Copyright (c) 2022 Rob Royce
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
import {animate, animateChild, group, query, state, style, transition, trigger} from "@angular/animations";

export const fadeInAndOut =
  trigger('routeAnimations', [
    transition('* <=> *', [
      style({position: 'relative'}),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({opacity: 0})
      ]),
      query(':leave', animateChild(), {optional: true}),
      group([
        query(':leave', [
          animate('300ms ease-out', style({opacity: 0}))
        ], {optional: true},),
        query(':enter', [
          animate('500ms ease-out', style({opacity: 1}))
        ]),
        query('@*', animateChild(), {optional: true})
      ]),
    ]),

  ]);

export const flyInOut = [
  trigger('flyInOut', [
    state('in', style({
      transform: 'translateX(0)'
    })),
    transition('void => *', [
      style({
        transform: 'translateX(-100%)'
      }),
      animate(100)
    ]),
    transition('* => void', [
      animate(100, style({
        transform: 'translateX(-100%)'
      }))
    ])
  ])
]

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
