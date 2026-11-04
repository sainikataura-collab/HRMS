import { TestBed } from '@angular/core/testing';

import { StateMasterService } from './state-master.service';

describe('StateMasterService', () => {
  let service: StateMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
