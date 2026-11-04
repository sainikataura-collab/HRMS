import { TestBed } from '@angular/core/testing';

import { RoleMasterService } from './role-master.service';

describe('RoleMasterService', () => {
  let service: RoleMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
