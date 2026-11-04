import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAssessmentViewComponent } from './emp-assessment-view.component';

describe('EmpAssessmentViewComponent', () => {
  let component: EmpAssessmentViewComponent;
  let fixture: ComponentFixture<EmpAssessmentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpAssessmentViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpAssessmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
