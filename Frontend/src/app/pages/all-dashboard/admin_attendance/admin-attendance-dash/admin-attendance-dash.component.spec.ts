import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttendanceDashComponent } from './admin-attendance-dash.component';

describe('AdminAttendanceDashComponent', () => {
  let component: AdminAttendanceDashComponent;
  let fixture: ComponentFixture<AdminAttendanceDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAttendanceDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttendanceDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
