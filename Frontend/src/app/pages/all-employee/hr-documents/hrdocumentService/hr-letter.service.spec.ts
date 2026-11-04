import { TestBed } from '@angular/core/testing';

import { HrLetterService } from './hr-letter.service';

describe('HrLetterService', () => {
  let service: HrLetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrLetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
