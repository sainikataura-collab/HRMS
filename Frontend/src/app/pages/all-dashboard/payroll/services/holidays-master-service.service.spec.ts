import { TestBed } from '@angular/core/testing';

import { HolidaysMasterServiceService } from './holidays-master-service.service';

describe('HolidaysMasterServiceService', () => {
  let service: HolidaysMasterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolidaysMasterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
