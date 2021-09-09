import { TestBed } from '@angular/core/testing';

import { KsFactoryService } from './ks-factory.service';

describe('KsFactoryService', () => {
  let service: KsFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
