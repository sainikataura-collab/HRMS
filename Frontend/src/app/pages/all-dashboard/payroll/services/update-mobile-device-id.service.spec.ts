import { TestBed } from '@angular/core/testing';

import { UpdateMobileDeviceIdService } from './update-mobile-device-id.service';

describe('UpdateMobileDeviceIdService', () => {
  let service: UpdateMobileDeviceIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateMobileDeviceIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
