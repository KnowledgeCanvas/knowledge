import { TestBed } from '@angular/core/testing';

import { KsInfoDialogService } from './ks-info-dialog.service';

describe('KsInfoDialogService', () => {
  let service: KsInfoDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KsInfoDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
