import { TestBed } from '@angular/core/testing';

import { LeaveEncashmentService } from './leave-encashment.service';

describe('LeaveEncashmentService', () => {
  let service: LeaveEncashmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveEncashmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
