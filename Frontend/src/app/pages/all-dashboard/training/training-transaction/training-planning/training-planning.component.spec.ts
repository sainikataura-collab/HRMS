import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPlanningComponent } from './training-planning.component';

describe('TrainingPlanningComponent', () => {
  let component: TrainingPlanningComponent;
  let fixture: ComponentFixture<TrainingPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
