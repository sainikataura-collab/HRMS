import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceInOutShiftComponent } from './attendance-in-out-shift.component';

describe('AttendanceInOutShiftComponent', () => {
  let component: AttendanceInOutShiftComponent;
  let fixture: ComponentFixture<AttendanceInOutShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceInOutShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceInOutShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
