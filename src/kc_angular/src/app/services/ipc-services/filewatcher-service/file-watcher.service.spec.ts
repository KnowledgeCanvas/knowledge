import { TestBed } from '@angular/core/testing';

import { FileWatcherService } from './file-watcher.service';

describe('FilewatcherIpcService', () => {
  let service: FileWatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileWatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
