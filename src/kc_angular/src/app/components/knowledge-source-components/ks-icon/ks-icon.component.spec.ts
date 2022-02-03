import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsIconComponent } from './ks-icon.component';

describe('KsIconComponent', () => {
  let component: KsIconComponent;
  let fixture: ComponentFixture<KsIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
