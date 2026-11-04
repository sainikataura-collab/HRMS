import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPlanningListComponent } from './training-planning-list.component';

describe('TrainingPlanningListComponent', () => {
  let component: TrainingPlanningListComponent;
  let fixture: ComponentFixture<TrainingPlanningListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingPlanningListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingPlanningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
