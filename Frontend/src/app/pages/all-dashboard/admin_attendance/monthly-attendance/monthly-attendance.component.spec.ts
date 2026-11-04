import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAttendanceComponent } from './monthly-attendance.component';

describe('MonthlyAttendanceComponent', () => {
  let component: MonthlyAttendanceComponent;
  let fixture: ComponentFixture<MonthlyAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
