import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsLibComponent } from './ks-lib.component';

describe('KsLibComponent', () => {
  let component: KsLibComponent;
  let fixture: ComponentFixture<KsLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
