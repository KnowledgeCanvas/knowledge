import { TestBed } from '@angular/core/testing';

import { IpcService } from './ipc.service';

describe('IpcService', () => {
  let service: IpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
