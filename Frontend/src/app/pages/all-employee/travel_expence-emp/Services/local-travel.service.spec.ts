import { TestBed } from '@angular/core/testing';

import { LocalTravelService } from './local-travel.service';

describe('LocalTravelService', () => {
  let service: LocalTravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalTravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
