import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalWellnessComponent } from './digital-wellness.component';

describe('DigitalWellnessComponent', () => {
  let component: DigitalWellnessComponent;
  let fixture: ComponentFixture<DigitalWellnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalWellnessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalWellnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
