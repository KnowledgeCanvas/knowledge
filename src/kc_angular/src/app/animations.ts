import {animate, animateChild, group, query, style, transition, trigger} from "@angular/animations";

export const slideInAnimation =
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
