import { TestBed } from '@angular/core/testing';

import { LodgingBoardingService } from './lodging-boarding.service';

describe('LodgingBoardingService', () => {
  let service: LodgingBoardingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LodgingBoardingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
