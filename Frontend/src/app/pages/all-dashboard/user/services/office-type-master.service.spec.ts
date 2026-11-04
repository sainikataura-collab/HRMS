import { TestBed } from '@angular/core/testing';

import { OfficeTypeMasterService } from './office-type-master.service';

describe('OfficeTypeMasterService', () => {
  let service: OfficeTypeMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficeTypeMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
