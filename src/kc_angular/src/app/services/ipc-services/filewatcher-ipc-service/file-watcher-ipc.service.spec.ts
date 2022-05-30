import { TestBed } from '@angular/core/testing';

import { FileWatcherIpcService } from './file-watcher-ipc.service';

describe('FilewatcherIpcService', () => {
  let service: FileWatcherIpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileWatcherIpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
