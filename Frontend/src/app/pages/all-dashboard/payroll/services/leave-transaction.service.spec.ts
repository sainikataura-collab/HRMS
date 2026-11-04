import { TestBed } from '@angular/core/testing';

import { LeaveTransactionService } from './leave-transaction.service';

describe('LeaveTransactionService', () => {
  let service: LeaveTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
