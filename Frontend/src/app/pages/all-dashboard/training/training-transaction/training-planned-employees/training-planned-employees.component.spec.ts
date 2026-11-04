import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPlannedEmployeesComponent } from './training-planned-employees.component';

describe('TrainingPlannedEmployeesComponent', () => {
  let component: TrainingPlannedEmployeesComponent;
  let fixture: ComponentFixture<TrainingPlannedEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingPlannedEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingPlannedEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
