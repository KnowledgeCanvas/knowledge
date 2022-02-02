import { TestBed } from '@angular/core/testing';

import { ProjectCommandService } from './project-command.service';

describe('ProjectCommandService', () => {
  let service: ProjectCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
