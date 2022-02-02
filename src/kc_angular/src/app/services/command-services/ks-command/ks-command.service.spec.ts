import { TestBed } from '@angular/core/testing';

import { KsCommandService } from './ks-command.service';

describe('KsCommandService', () => {
  let service: KsCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
