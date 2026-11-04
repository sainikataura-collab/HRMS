import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpRmAssessmentListComponent } from './emp-rm-assessment-list.component';

describe('EmpRmAssessmentListComponent', () => {
  let component: EmpRmAssessmentListComponent;
  let fixture: ComponentFixture<EmpRmAssessmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpRmAssessmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpRmAssessmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
