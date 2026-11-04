import { TestBed } from '@angular/core/testing';

import { UpdateEmployeeMobileNoService } from './update-employee-mobile-no.service';

describe('UpdateEmployeeMobileNoService', () => {
  let service: UpdateEmployeeMobileNoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateEmployeeMobileNoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
