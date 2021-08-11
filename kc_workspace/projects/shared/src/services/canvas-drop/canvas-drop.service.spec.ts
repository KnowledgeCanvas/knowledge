import { TestBed } from '@angular/core/testing';

import { CanvasDropService } from './canvas-drop.service';

describe('CanvasDropService', () => {
  let service: CanvasDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
