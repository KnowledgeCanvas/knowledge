import { TestBed } from '@angular/core/testing';

import { FaviconExtractorService } from './favicon-extractor.service';

describe('FaviconExtractorService', () => {
  let service: FaviconExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaviconExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
