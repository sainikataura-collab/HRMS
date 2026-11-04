import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingMarkAttendanceViewComponent } from './training-mark-attendance-view.component';

describe('TrainingMarkAttendanceViewComponent', () => {
  let component: TrainingMarkAttendanceViewComponent;
  let fixture: ComponentFixture<TrainingMarkAttendanceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingMarkAttendanceViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingMarkAttendanceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
