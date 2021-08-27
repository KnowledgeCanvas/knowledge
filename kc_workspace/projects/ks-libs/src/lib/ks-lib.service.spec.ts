import { TestBed } from '@angular/core/testing';

import { KsLibService } from './ks-lib.service';

describe('KsLibService', () => {
  let service: KsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
