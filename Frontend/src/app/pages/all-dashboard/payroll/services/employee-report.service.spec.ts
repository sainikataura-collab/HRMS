import { TestBed } from '@angular/core/testing';

import { EmployeeReportService } from './employee-report.service';

describe('EmployeeReportService', () => {
  let service: EmployeeReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
