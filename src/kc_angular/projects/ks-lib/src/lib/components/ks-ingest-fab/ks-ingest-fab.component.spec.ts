import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsIngestFabComponent } from './ks-ingest-fab.component';

describe('KsIngestFabComponent', () => {
  let component: KsIngestFabComponent;
  let fixture: ComponentFixture<KsIngestFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsIngestFabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsIngestFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
