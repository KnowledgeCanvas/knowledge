import { TestBed } from '@angular/core/testing';

import { ExternalIngestService } from './external-ingest.service';

describe('ChromeExtensionService', () => {
  let service: ExternalIngestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalIngestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
