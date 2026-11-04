import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingMarkAttendanceComponent } from './training-mark-attendance.component';

describe('TrainingMarkAttendanceComponent', () => {
  let component: TrainingMarkAttendanceComponent;
  let fixture: ComponentFixture<TrainingMarkAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingMarkAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingMarkAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
