import { TestBed } from '@angular/core/testing';

import { LeavereqService } from './leavereq.service';

describe('LeavereqService', () => {
  let service: LeavereqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeavereqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
