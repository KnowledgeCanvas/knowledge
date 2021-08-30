import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestImportSelectorComponent } from './ingest-import-selector.component';

describe('IngestImportSelectorComponent', () => {
  let component: IngestImportSelectorComponent;
  let fixture: ComponentFixture<IngestImportSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngestImportSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestImportSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
