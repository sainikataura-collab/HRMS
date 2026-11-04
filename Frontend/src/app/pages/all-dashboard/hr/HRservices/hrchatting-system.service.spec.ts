import { TestBed } from '@angular/core/testing';

import { HRchattingSystemService } from './hrchatting-system.service';

describe('HRchattingSystemService', () => {
  let service: HRchattingSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HRchattingSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
