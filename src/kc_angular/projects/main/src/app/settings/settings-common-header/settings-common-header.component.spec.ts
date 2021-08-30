import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCommonHeaderComponent } from './settings-common-header.component';

describe('SettingsCommonHeaderComponent', () => {
  let component: SettingsCommonHeaderComponent;
  let fixture: ComponentFixture<SettingsCommonHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsCommonHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsCommonHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
