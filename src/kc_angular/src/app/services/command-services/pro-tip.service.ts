import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ProTipsComponent } from '@components/shared/pro-tips.component';
import { ProTip } from '@app/directives/pro-tip.directive';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProTipService {
  private overlayPanel!: OverlayPanel;

  private component!: ProTipsComponent;

  private proTips: ProTip[] = [];

  private selection = new BehaviorSubject<ProTip[]>([]);

  private index = new BehaviorSubject<number>(0);

  private proTip = new BehaviorSubject<ProTip | null>(null);

  proTip$ = this.proTip.asObservable();

  selection$ = this.selection.asObservable();

  index$ = this.index.asObservable();

  constructor() {
    this.proTip$.subscribe((t: ProTip | null) => {
      if (t) {
        this.createOverlay(t);
      }
    });

    combineLatest([
      this.selection$.pipe(
        distinctUntilChanged((a, b) => {
          if (a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++)
            if (a[i].name !== b[i].name) return false;
          return true;
        })
      ),
      this.index$.pipe(distinctUntilChanged((a, b) => a === b)),
    ]).subscribe(([s, i]) => {
      if (s.length > 0 && i >= 0 && i < s.length && s[i].element && s[i].view) {
        this.proTip.next(s[i]);
      } else {
        this.proTip.next(s[0]);
      }
    });
  }

  hide() {
    this.overlayPanel.hide();
  }

  setProTip(tip: ProTip) {
    this.component.header = tip.name;
    this.component.body = tip.message;
    this.component.icon = tip.icon ? tip.icon : 'pi pi-info-circle';
  }

  createOverlay(t: ProTip) {
    this.overlayPanel.hide();

    setTimeout(() => {
      this.setProTip(t);

      // Modify the nativeElement to ensure the overlay panel is positioned correctly
      const top = t.element.nativeElement.style.top;
      const left = t.element.nativeElement.style.left;
      t.element.nativeElement.style.position = 'relative';
      t.element.nativeElement.style.top = t.offsetY;
      t.element.nativeElement.style.left = t.offsetX;

      // Create a mouse click event to pass to the overlay panel (provides the position)
      const event = new MouseEvent('click', {
        view: t.view.element.nativeElement.ownerDocument.defaultView,
        bubbles: true,
        cancelable: true,
      });
      this.overlayPanel.show(event, t.element.nativeElement);

      // Reset the nativeElement position
      setTimeout(() => {
        t.element.nativeElement.style.top = top;
        t.element.nativeElement.style.left = left;
      });
    }, 250);
  }

  register(proTip: ProTip) {
    // Do not add duplicate tips
    if (
      this.proTips.find(
        (t) => t.name === proTip.name && t.message === proTip.message
      )
    ) {
      return;
    }
    this.proTips.push(proTip);
  }

  setTarget(target: OverlayPanel, component: ProTipsComponent) {
    this.overlayPanel = target;
    this.overlayPanel.dismissable = false;
    this.component = component;
    this.setListeners();
  }

  setListeners() {
    this.component.next.subscribe(() => {
      this.index.next((this.index.value + 1) % this.selection.value.length);
    });

    this.component.previous.subscribe(() => {
      this.index.next(
        (this.index.value - 1 + this.selection.value.length) %
          this.selection.value.length
      );
    });

    this.component.close.subscribe(() => {
      console.log('close');
    });
  }

  show() {
    this.overlayPanel.hide();
    this.proTip.next(null);
    this.index.next(0);
    this.selection.next(this.proTips);
  }

  showByName(name: string) {
    // Filter the tips by name and display them in order
    this.selection.next(this.proTips.filter((t) => t.name === name));
  }

  showByGroup(group: string) {
    // Filter the tips by group and display them in order
    this.selection.next(this.proTips.filter((t) => t.groups.includes(group)));
  }

  unregister(name: string) {
    this.proTips = this.proTips.filter((t) => t.name !== name);
  }
}
