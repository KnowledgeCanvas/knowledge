import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestSettingsComponent } from './ingest-settings.component';

describe('IngestSettingsComponent', () => {
  let component: IngestSettingsComponent;
  let fixture: ComponentFixture<IngestSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngestSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
