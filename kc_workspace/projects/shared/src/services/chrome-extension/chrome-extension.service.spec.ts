import { TestBed } from '@angular/core/testing';

import { ChromeExtensionService } from './chrome-extension.service';

describe('ChromeExtensionService', () => {
  let service: ChromeExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChromeExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
