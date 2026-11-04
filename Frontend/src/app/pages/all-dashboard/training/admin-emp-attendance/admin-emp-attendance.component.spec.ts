import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmpAttendanceComponent } from './admin-emp-attendance.component';

describe('AdminEmpAttendanceComponent', () => {
  let component: AdminEmpAttendanceComponent;
  let fixture: ComponentFixture<AdminEmpAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEmpAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEmpAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
