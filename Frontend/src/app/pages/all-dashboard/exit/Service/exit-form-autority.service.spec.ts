import { TestBed } from '@angular/core/testing';

import { ExitFormAutorityService } from './exit-form-autority.service';

describe('ExitFormAutorityService', () => {
  let service: ExitFormAutorityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExitFormAutorityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
