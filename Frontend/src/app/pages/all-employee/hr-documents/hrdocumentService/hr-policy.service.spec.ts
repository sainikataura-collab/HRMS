import { TestBed } from '@angular/core/testing';

import { HrPolicyService } from './hr-policy.service';

describe('HrPolicyService', () => {
  let service: HrPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
