import { TestBed } from '@angular/core/testing';

import { CategoryMasterServiceService } from './category-master-service.service';

describe('CategoryMasterServiceService', () => {
  let service: CategoryMasterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryMasterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
