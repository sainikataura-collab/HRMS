import { TestBed } from '@angular/core/testing';

import { BillgenerationService } from './billgeneration.service';

describe('BillgenerationService', () => {
  let service: BillgenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillgenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
