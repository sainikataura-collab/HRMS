import { TestBed } from '@angular/core/testing';

import { CandidateFamilyDetailsService } from './candidate-family-details.service';

describe('CandidateFamilyDetailsService', () => {
  let service: CandidateFamilyDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateFamilyDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
