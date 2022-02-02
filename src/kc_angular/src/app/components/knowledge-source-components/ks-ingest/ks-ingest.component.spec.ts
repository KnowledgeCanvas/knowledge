import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsIngestComponent } from './ks-ingest.component';

describe('KsIngestComponent', () => {
  let component: KsIngestComponent;
  let fixture: ComponentFixture<KsIngestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsIngestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsIngestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
