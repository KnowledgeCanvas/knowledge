import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsContextMenuComponent } from './ks-context-menu.component';

describe('KsContextMenuComponent', () => {
  let component: KsContextMenuComponent;
  let fixture: ComponentFixture<KsContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsContextMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
