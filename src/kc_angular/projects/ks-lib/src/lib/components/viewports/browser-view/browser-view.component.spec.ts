import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserViewComponent } from './browser-view.component';

describe('BrowserViewComponent', () => {
  let component: BrowserViewComponent;
  let fixture: ComponentFixture<BrowserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
