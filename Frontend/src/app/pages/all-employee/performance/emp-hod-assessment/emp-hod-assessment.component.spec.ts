import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpHodAssessmentComponent } from './emp-hod-assessment.component';

describe('EmpHodAssessmentComponent', () => {
  let component: EmpHodAssessmentComponent;
  let fixture: ComponentFixture<EmpHodAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpHodAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpHodAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
