import { TestBed } from '@angular/core/testing';

import { TravelRateService } from './travel-rate.service';

describe('TravelRateService', () => {
  let service: TravelRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TravelRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
