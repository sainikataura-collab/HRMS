import { TestBed } from '@angular/core/testing';

import { UpdateEmployeeEmailService } from './update-employee-email.service';

describe('UpdateEmployeeEmailService', () => {
  let service: UpdateEmployeeEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateEmployeeEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
