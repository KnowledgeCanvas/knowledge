import { TestBed } from '@angular/core/testing';

import { BrowserViewDialogService } from './browser-view-dialog.service';

describe('BrowserViewDialogService', () => {
  let service: BrowserViewDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserViewDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
