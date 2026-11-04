import { TestBed } from '@angular/core/testing';

import { ImportdaywiseAttendanceService } from './importdaywise-attendance.service';

describe('ImportdaywiseAttendanceService', () => {
  let service: ImportdaywiseAttendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportdaywiseAttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
