import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalApprovalComponent } from './appraisal-approval.component';

describe('AppraisalApprovalComponent', () => {
  let component: AppraisalApprovalComponent;
  let fixture: ComponentFixture<AppraisalApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
