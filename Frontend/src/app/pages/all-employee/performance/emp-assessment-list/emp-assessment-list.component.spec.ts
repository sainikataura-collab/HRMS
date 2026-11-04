import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAssessmentListComponent } from './emp-assessment-list.component';

describe('EmpAssessmentListComponent', () => {
  let component: EmpAssessmentListComponent;
  let fixture: ComponentFixture<EmpAssessmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpAssessmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpAssessmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
