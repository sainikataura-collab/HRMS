import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfAssessmentReportComponent } from './self-assessment-report.component';

describe('SelfAssessmentReportComponent', () => {
  let component: SelfAssessmentReportComponent;
  let fixture: ComponentFixture<SelfAssessmentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelfAssessmentReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelfAssessmentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
