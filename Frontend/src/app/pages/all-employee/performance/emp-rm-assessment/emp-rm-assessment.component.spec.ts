import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpRmAssessmentComponent } from './emp-rm-assessment.component';

describe('EmpRmAssessmentComponent', () => {
  let component: EmpRmAssessmentComponent;
  let fixture: ComponentFixture<EmpRmAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpRmAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpRmAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
