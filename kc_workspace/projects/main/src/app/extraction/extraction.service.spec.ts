import { TestBed } from '@angular/core/testing';

import { ExtractionService } from './extraction.service';

describe('ExtractionService', () => {
  let service: ExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
