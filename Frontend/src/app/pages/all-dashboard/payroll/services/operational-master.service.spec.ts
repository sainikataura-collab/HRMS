import { TestBed } from '@angular/core/testing';

import { OperationalMasterService } from './operational-master.service';

describe('OperationalMasterService', () => {
  let service: OperationalMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationalMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
