import { TestBed } from '@angular/core/testing';

import { TravelExpenceServicesService } from './travel-expence-services.service';

describe('TravelExpenceServicesService', () => {
  let service: TravelExpenceServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TravelExpenceServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
