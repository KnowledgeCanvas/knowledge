import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsCardComponent } from './ks-card.component';

describe('KsCardComponent', () => {
  let component: KsCardComponent;
  let fixture: ComponentFixture<KsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
