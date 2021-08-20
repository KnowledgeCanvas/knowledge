import {TestBed} from '@angular/core/testing';

import {ExtractionService} from './extraction.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('ExtractionService', () => {
  let service: ExtractionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
