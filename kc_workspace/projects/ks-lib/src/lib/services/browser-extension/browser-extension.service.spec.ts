import { TestBed } from '@angular/core/testing';

import { BrowserExtensionService } from './browser-extension.service';

describe('BrowserExtensionService', () => {
  let service: BrowserExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
