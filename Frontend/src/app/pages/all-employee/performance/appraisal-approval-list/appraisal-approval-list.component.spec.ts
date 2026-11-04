import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalApprovalListComponent } from './appraisal-approval-list.component';

describe('AppraisalApprovalListComponent', () => {
  let component: AppraisalApprovalListComponent;
  let fixture: ComponentFixture<AppraisalApprovalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalApprovalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalApprovalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
