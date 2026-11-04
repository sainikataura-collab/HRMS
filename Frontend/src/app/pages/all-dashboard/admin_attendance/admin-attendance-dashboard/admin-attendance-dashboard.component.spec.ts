import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAttendanceDashboardComponent } from './admin-attendance-dashboard.component';

describe('AdminAttendanceDashboardComponent', () => {
  let component: AdminAttendanceDashboardComponent;
  let fixture: ComponentFixture<AdminAttendanceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAttendanceDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAttendanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
