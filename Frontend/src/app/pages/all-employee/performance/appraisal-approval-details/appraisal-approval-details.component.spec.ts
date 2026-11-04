import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalApprovalDetailsComponent } from './appraisal-approval-details.component';

describe('AppraisalApprovalDetailsComponent', () => {
  let component: AppraisalApprovalDetailsComponent;
  let fixture: ComponentFixture<AppraisalApprovalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalApprovalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalApprovalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
