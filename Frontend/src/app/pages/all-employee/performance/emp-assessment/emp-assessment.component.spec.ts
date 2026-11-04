import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAssessmentComponent } from './emp-assessment.component';

describe('EmpAssessmentComponent', () => {
  let component: EmpAssessmentComponent;
  let fixture: ComponentFixture<EmpAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
