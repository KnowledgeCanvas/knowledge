import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaySettingsComponent } from './display-settings.component';

describe('DisplaySettingsComponent', () => {
  let component: DisplaySettingsComponent;
  let fixture: ComponentFixture<DisplaySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplaySettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
