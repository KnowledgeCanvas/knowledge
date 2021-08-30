import { TestBed } from '@angular/core/testing';

import { KsQueueService } from './ks-queue.service';

describe('KsQueueService', () => {
  let service: KsQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
