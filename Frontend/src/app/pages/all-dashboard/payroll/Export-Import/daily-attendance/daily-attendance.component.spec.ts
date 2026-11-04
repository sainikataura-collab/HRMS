import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAttendanceComponent } from './daily-attendance.component';

describe('DailyAttendanceComponent', () => {
  let component: DailyAttendanceComponent;
  let fixture: ComponentFixture<DailyAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
