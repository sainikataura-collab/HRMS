import { TestBed } from '@angular/core/testing';

import { RegligionMasterService } from './regligion-master.service';

describe('RegligionMasterService', () => {
  let service: RegligionMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegligionMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
