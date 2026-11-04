import { TestBed } from '@angular/core/testing';

import { CityCategoryMasterServiceService } from './city-category-master-service.service';

describe('CityCategoryMasterServiceService', () => {
  let service: CityCategoryMasterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CityCategoryMasterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
