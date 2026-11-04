import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpHodAssessmentListComponent } from './emp-hod-assessment-list.component';

describe('EmpHodAssessmentListComponent', () => {
  let component: EmpHodAssessmentListComponent;
  let fixture: ComponentFixture<EmpHodAssessmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpHodAssessmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpHodAssessmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
