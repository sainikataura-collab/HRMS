import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceReportComponent } from './compliance-report.component';

describe('ComplianceReportComponent', () => {
  let component: ComplianceReportComponent;
  let fixture: ComponentFixture<ComplianceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
