import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTeamAttendanceComponent } from './view-team-attendance.component';

describe('ViewTeamAttendanceComponent', () => {
  let component: ViewTeamAttendanceComponent;
  let fixture: ComponentFixture<ViewTeamAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTeamAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTeamAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
