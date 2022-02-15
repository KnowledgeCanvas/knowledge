import { TestBed } from '@angular/core/testing';

import { ProjectTreeFactoryService } from './project-tree-factory.service';

describe('ProjectTreeFactoryServiceService', () => {
  let service: ProjectTreeFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectTreeFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
