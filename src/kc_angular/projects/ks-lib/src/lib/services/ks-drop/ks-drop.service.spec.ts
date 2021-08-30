import { TestBed } from '@angular/core/testing';

import { KsDropService } from './ks-drop.service';

describe('CanvasDropService', () => {
  let service: KsDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
