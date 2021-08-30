import { TestBed } from '@angular/core/testing';

import { KcDialogService } from './kc-dialog.service';

describe('ConfirmDialogService', () => {
  let service: KcDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KcDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
