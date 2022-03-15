import { TestBed } from '@angular/core/testing';

import { KsContextMenuService } from './ks-context-menu.service';

describe('KsContextMenuService', () => {
  let service: KsContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsContextMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
