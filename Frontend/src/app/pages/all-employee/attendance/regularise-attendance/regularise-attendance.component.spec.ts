import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulariseAttendanceComponent } from './regularise-attendance.component';

describe('RegulariseAttendanceComponent', () => {
  let component: RegulariseAttendanceComponent;
  let fixture: ComponentFixture<RegulariseAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulariseAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegulariseAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
