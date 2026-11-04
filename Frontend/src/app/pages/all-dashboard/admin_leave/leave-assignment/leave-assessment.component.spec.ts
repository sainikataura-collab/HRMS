import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveAssessmentComponent } from './leave-assessment.component';

describe('LeaveAssessmentComponent', () => {
  let component: LeaveAssessmentComponent;
  let fixture: ComponentFixture<LeaveAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
