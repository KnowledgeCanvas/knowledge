import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalWellnessSettingsComponent } from './digital-wellness-settings.component';

describe('DigitalWellnessSettingsComponent', () => {
  let component: DigitalWellnessSettingsComponent;
  let fixture: ComponentFixture<DigitalWellnessSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalWellnessSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalWellnessSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
